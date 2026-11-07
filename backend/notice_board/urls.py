from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AdminNoticeViewSet, PublicNoticeViewSet

router = DefaultRouter()
router.register(r'admin/notices', AdminNoticeViewSet, basename='admin-notices')
router.register(r'notices', PublicNoticeViewSet, basename='public-notices')

urlpatterns = [
    path('', include(router.urls)),
]
