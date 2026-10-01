from django.db.models import Q
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response

from .models import Book
from .serializers import BookSerializer


class BookViewSet(viewsets.ModelViewSet):
    """
    API for Books and Study Materials:
    - GET /api/books (with optional ?category=, ?subject=, ?search=)
    - GET /api/books/<id>/
    - POST /api/books/ (Admin only)
    - PUT/PATCH /api/books/<id>/ (Admin only)
    - DELETE /api/books/<id>/ (Admin only)
    """
    queryset = Book.objects.filter(is_deleted=False)
    serializer_class = BookSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated(), permissions.IsAdminUser()]

    def get_queryset(self):
        queryset = Book.objects.filter(is_deleted=False)

        # Category filter (e.g. "Class 11", "JEE Prep")
        category = self.request.query_params.get('category')
        if category and category != 'All':
            queryset = queryset.filter(category__iexact=category)

        # Subject filter (e.g. "Physics", "Chemistry")
        subject = self.request.query_params.get('subject')
        if subject and subject != 'All':
            queryset = queryset.filter(subject__iexact=subject)

        # Search filter (title, author, description)
        search = self.request.query_params.get('search')
        if search:
            search = search.strip()
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(author__icontains=search) |
                Q(subject__icontains=search) |
                Q(description__icontains=search)
            )

        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "success": True,
            "count": len(serializer.data),
            "data": serializer.data
        })

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({
            "success": True,
            "data": serializer.data
        })

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response({
            "success": True,
            "message": "Book created successfully.",
            "data": serializer.data
        }, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response({
            "success": True,
            "message": "Book updated successfully.",
            "data": serializer.data
        })

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.is_deleted = True
        instance.save()
        return Response({
            "success": True,
            "message": "Book deleted successfully.",
            "data": {}
        }, status=status.HTTP_200_OK)
