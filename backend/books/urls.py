from django.urls import path, re_path, include
from rest_framework.routers import DefaultRouter
from .views import BookViewSet

router = DefaultRouter()
router.register(r'books', BookViewSet, basename='books')

urlpatterns = [
    re_path(r'^books/?$', BookViewSet.as_view({'get': 'list', 'post': 'create'}), name='books-list-direct'),
    re_path(r'^books/(?P<pk>\d+)/?$', BookViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'patch': 'partial_update',
        'delete': 'destroy'
    }), name='books-detail-direct'),
    path('', include(router.urls)),
]
