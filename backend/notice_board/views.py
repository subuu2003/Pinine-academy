from django.utils import timezone
from django.db.models import Q
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action

from .models import Notice
from .serializers import AdminNoticeSerializer, PublicNoticeSerializer


class IsAdmin(permissions.BasePermission):
    """
    Permission check verifying that the user is authenticated and is an administrator.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.is_staff or getattr(request.user, 'role', '') == 'ADMIN' or request.user.is_superuser)
        )


class AdminNoticeViewSet(viewsets.ModelViewSet):
    """
    Administrator API for Notice Management:
    - CRUD notices
    - Filter by category & status
    - Search by keyword
    - Publish / Unpublish
    - Soft delete
    - Overview statistics
    """
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    serializer_class = AdminNoticeSerializer
    queryset = Notice.objects.active()

    def get_queryset(self):
        queryset = Notice.objects.active()
        now = timezone.now()

        # Category filter
        category_param = self.request.query_params.get('category')
        if category_param and category_param.upper() != 'ALL':
            queryset = queryset.filter(category=category_param.upper())

        # Status filter
        status_param = self.request.query_params.get('status')
        if status_param and status_param.upper() != 'ALL':
            status_upper = status_param.upper()
            if status_upper == 'DRAFT':
                queryset = queryset.filter(Q(is_published=False) | Q(status=Notice.STATUS_DRAFT))
            elif status_upper == 'PUBLISHED':
                queryset = queryset.filter(is_published=True, status=Notice.STATUS_PUBLISHED)
            elif status_upper == 'ACTIVE':
                queryset = queryset.filter(
                    is_published=True,
                    status=Notice.STATUS_PUBLISHED,
                    publish_date__lte=now
                ).filter(
                    Q(expiry_date__isnull=True) | Q(expiry_date__gt=now)
                )
            elif status_upper == 'EXPIRED':
                queryset = queryset.filter(
                    expiry_date__isnull=False,
                    expiry_date__lte=now
                )
            elif status_upper == 'SCHEDULED':
                queryset = queryset.filter(
                    is_published=True,
                    status=Notice.STATUS_PUBLISHED,
                    publish_date__gt=now
                )

        # Direct is_published filter if passed
        is_published = self.request.query_params.get('is_published')
        if is_published is not None:
            if is_published.lower() in ['true', '1']:
                queryset = queryset.filter(is_published=True)
            elif is_published.lower() in ['false', '0']:
                queryset = queryset.filter(is_published=False)

        # Keyword search
        search = self.request.query_params.get('search')
        if search:
            search = search.strip()
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(short_description__icontains=search) |
                Q(content__icontains=search)
            )

        return queryset.order_by('-publish_date', '-created_at')

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def perform_destroy(self, instance):
        # Soft-delete notice
        instance.is_deleted = True
        instance.save(update_fields=['is_deleted', 'updated_at'])

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {'detail': f'Notice "{instance.title}" has been deleted.'},
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['post'], url_path='publish')
    def publish(self, request, pk=None):
        notice = self.get_object()
        notice.status = Notice.STATUS_PUBLISHED
        notice.is_published = True
        # If publish_date is not set or in the past when creating draft, keep as is or ensure set
        if not notice.publish_date:
            notice.publish_date = timezone.now()
        notice.save()
        serializer = self.get_serializer(notice)
        return Response({
            'detail': f'Notice "{notice.title}" is now published.',
            'notice': serializer.data
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='unpublish')
    def unpublish(self, request, pk=None):
        notice = self.get_object()
        notice.status = Notice.STATUS_DRAFT
        notice.is_published = False
        notice.save()
        serializer = self.get_serializer(notice)
        return Response({
            'detail': f'Notice "{notice.title}" has been moved to drafts.',
            'notice': serializer.data
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='stats')
    def stats(self, request):
        now = timezone.now()
        base_qs = Notice.objects.active()
        return Response({
            'total': base_qs.count(),
            'published': base_qs.filter(is_published=True).count(),
            'draft': base_qs.filter(Q(is_published=False) | Q(status=Notice.STATUS_DRAFT)).count(),
            'active': base_qs.filter(
                is_published=True,
                status=Notice.STATUS_PUBLISHED,
                publish_date__lte=now
            ).filter(
                Q(expiry_date__isnull=True) | Q(expiry_date__gt=now)
            ).count(),
            'expired': base_qs.filter(expiry_date__isnull=False, expiry_date__lte=now).count(),
            'scheduled': base_qs.filter(
                is_published=True,
                status=Notice.STATUS_PUBLISHED,
                publish_date__gt=now
            ).count(),
            'server_time': now,
        }, status=status.HTTP_200_OK)


class PublicNoticeViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Public & Student-facing API for viewing active published notices:
    - Strictly hides drafts, unpublished, scheduled (future), and expired notices
    - Filter by category
    - Search by keyword
    - View notice details
    - Read-only
    """
    permission_classes = [permissions.AllowAny]
    serializer_class = PublicNoticeSerializer
    queryset = Notice.objects.live()

    def get_queryset(self):
        # Strict enforcement: only active published non-expired notices
        queryset = Notice.objects.live()

        # Category filter
        category_param = self.request.query_params.get('category')
        if category_param and category_param.upper() != 'ALL':
            queryset = queryset.filter(category=category_param.upper())

        # Search filter
        search = self.request.query_params.get('search')
        if search:
            search = search.strip()
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(short_description__icontains=search) |
                Q(content__icontains=search)
            )

        return queryset.order_by('-publish_date')

    @action(detail=False, methods=['get'], url_path='latest')
    def latest(self, request):
        limit_param = request.query_params.get('limit', 5)
        try:
            limit = max(1, min(int(limit_param), 20))
        except (ValueError, TypeError):
            limit = 5

        qs = Notice.objects.live().order_by('-publish_date')[:limit]
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
