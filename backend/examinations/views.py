from django.utils import timezone
from django.db.models import Q
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError as DRFValidationError

from .models import Examination
from .serializers import AdminExaminationSerializer, StudentExaminationSerializer

class AdminExaminationViewSet(viewsets.ModelViewSet):
    """
    Administrator API for full Examination Lifecycle Management:
    - Create examinations
    - List / Search / Filter examinations
    - Retrieve details
    - Edit examination details and schedules
    - Publish / Unpublish examinations
    - Soft delete examinations
    - Overview statistics
    """
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]
    serializer_class = AdminExaminationSerializer
    queryset = Examination.objects.active()

    def get_queryset(self):
        queryset = Examination.objects.active()
        now = timezone.now()

        # Status filter
        status_param = self.request.query_params.get('status')
        if status_param:
            status_upper = status_param.upper()
            if status_upper == 'UPCOMING':
                queryset = queryset.filter(start_datetime__gt=now)
            elif status_upper in ['ONGOING', 'AVAILABLE']:
                queryset = queryset.filter(start_datetime__lte=now, end_datetime__gt=now)
            elif status_upper == 'COMPLETED':
                queryset = queryset.filter(end_datetime__lte=now)

        # Publication status filter
        pub_param = self.request.query_params.get('publication_status') or self.request.query_params.get('publication_state')
        if pub_param:
            pub_upper = pub_param.upper()
            if pub_upper in ['DRAFT', 'PUBLISHED']:
                queryset = queryset.filter(publication_status=pub_upper)

        is_published = self.request.query_params.get('is_published')
        if is_published is not None:
            if is_published.lower() in ['true', '1']:
                queryset = queryset.filter(is_published=True)
            elif is_published.lower() in ['false', '0']:
                queryset = queryset.filter(is_published=False)

        # Search filter
        search = self.request.query_params.get('search')
        if search:
            search = search.strip()
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(description__icontains=search)
            )

        return queryset.order_by('-exam_date', '-start_time')

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.current_status == 'ONGOING':
            return Response(
                {'detail': 'Cannot delete an examination that is currently ongoing.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        instance.soft_delete()
        return Response(
            {'detail': f'Examination "{instance.title}" has been deleted.'},
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['post'], url_path='publish')
    def publish(self, request, pk=None):
        instance = self.get_object()
        instance.publication_status = 'PUBLISHED'
        instance.is_published = True
        instance.save(update_fields=['publication_status', 'is_published', 'updated_at'])
        return Response({
            'detail': f'Examination "{instance.title}" is now published.',
            'examination': AdminExaminationSerializer(instance, context={'request': request}).data
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='unpublish')
    def unpublish(self, request, pk=None):
        instance = self.get_object()
        instance.publication_status = 'DRAFT'
        instance.is_published = False
        instance.save(update_fields=['publication_status', 'is_published', 'updated_at'])
        return Response({
            'detail': f'Examination "{instance.title}" is now unpublished (Draft).',
            'examination': AdminExaminationSerializer(instance, context={'request': request}).data
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='toggle-publish')
    def toggle_publish(self, request, pk=None):
        instance = self.get_object()
        new_status = 'DRAFT' if instance.is_published else 'PUBLISHED'
        instance.publication_status = new_status
        instance.is_published = (new_status == 'PUBLISHED')
        instance.save(update_fields=['publication_status', 'is_published', 'updated_at'])
        action_word = 'published' if instance.is_published else 'unpublished'
        return Response({
            'detail': f'Examination "{instance.title}" has been {action_word}.',
            'examination': AdminExaminationSerializer(instance, context={'request': request}).data
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='stats')
    def stats(self, request):
        now = timezone.now()
        base_qs = Examination.objects.active()
        return Response({
            'total': base_qs.count(),
            'published': base_qs.filter(is_published=True).count(),
            'draft': base_qs.filter(is_published=False).count(),
            'upcoming': base_qs.filter(start_datetime__gt=now).count(),
            'ongoing': base_qs.filter(start_datetime__lte=now, end_datetime__gt=now).count(),
            'completed': base_qs.filter(end_datetime__lte=now).count(),
            'server_time': now,
        }, status=status.HTTP_200_OK)


class StudentExaminationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Student-facing API for viewing published examinations:
    - Can only view published, non-deleted examinations
    - Can filter by upcoming, ongoing/available, completed
    - View individual examination details
    - Strictly Read-Only (no create, edit, delete, or publish rights)
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = StudentExaminationSerializer
    queryset = Examination.objects.published()

    def get_queryset(self):
        # Strict enforcement: only published and non-deleted
        queryset = Examination.objects.published()
        now = timezone.now()

        # Status filter
        status_param = self.request.query_params.get('status')
        if status_param:
            status_upper = status_param.upper()
            if status_upper == 'UPCOMING':
                queryset = queryset.filter(start_datetime__gt=now)
            elif status_upper in ['ONGOING', 'AVAILABLE']:
                queryset = queryset.filter(start_datetime__lte=now, end_datetime__gt=now)
            elif status_upper == 'COMPLETED':
                queryset = queryset.filter(end_datetime__lte=now)

        # Search filter
        search = self.request.query_params.get('search')
        if search:
            search = search.strip()
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(description__icontains=search)
            )

        return queryset.order_by('start_datetime')

    @action(detail=False, methods=['get'], url_path='upcoming')
    def upcoming(self, request):
        now = timezone.now()
        qs = Examination.objects.published().filter(start_datetime__gt=now).order_by('start_datetime')
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='available')
    def available(self, request):
        now = timezone.now()
        qs = Examination.objects.published().filter(start_datetime__lte=now, end_datetime__gt=now).order_by('start_datetime')
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='completed')
    def completed(self, request):
        now = timezone.now()
        qs = Examination.objects.published().filter(end_datetime__lte=now).order_by('-end_datetime')
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], url_path='availability')
    def availability(self, request, pk=None):
        instance = self.get_object()
        now = timezone.now()
        return Response({
            'id': instance.id,
            'title': instance.title,
            'current_status': instance.current_status,
            'is_available': instance.is_available,
            'start_datetime': instance.start_datetime,
            'end_datetime': instance.end_datetime,
            'server_time': now,
        })
