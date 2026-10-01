from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView,
    LoginView,
    ProfileView,
    ChangePasswordView,
    CheckAuthView,
    AdminUserViewSet,
)

router = DefaultRouter()
router.register(r'admin/users', AdminUserViewSet, basename='admin-users')

urlpatterns = [
    # Auth & Profile Endpoints (/api/auth/...)
    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    path('auth/login/', LoginView.as_view(), name='auth_login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/profile/', ProfileView.as_view(), name='user_profile'),
    path('auth/change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('auth/check/', CheckAuthView.as_view(), name='auth_check'),
    path('auth/me/', ProfileView.as_view(), name='user_me'),

    # Backward compatibility aliases (/api/...)
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('me/', ProfileView.as_view(), name='me'),
    path('check/', CheckAuthView.as_view(), name='check'),

    # Admin Management Router (/api/admin/users/...)
    path('', include(router.urls)),
]
