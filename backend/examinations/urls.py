from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AdminExaminationViewSet, StudentExaminationViewSet

router = DefaultRouter()
router.register(r'admin/examinations', AdminExaminationViewSet, basename='admin-examinations')
router.register(r'examinations', StudentExaminationViewSet, basename='student-examinations')

urlpatterns = [
    path('', include(router.urls)),
]
