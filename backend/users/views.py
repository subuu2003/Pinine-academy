from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from django.contrib.auth import get_user_model
from django.db.models import Q
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import (
    UserSerializer,
    RegisterSerializer,
    LoginSerializer,
    ProfileUpdateSerializer,
    ChangePasswordSerializer,
    AdminUserSerializer,
    AdminUserCreateSerializer,
)

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'detail': 'Registration successful.'
        }, status=status.HTTP_201_CREATED)

class LoginView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            errors = serializer.errors
            if isinstance(errors, dict) and errors.get('inactive'):
                return Response(errors, status=status.HTTP_403_FORBIDDEN)
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)

class ProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return ProfileUpdateSerializer
        return UserSerializer

    def get_object(self):
        return self.request.user

class ChangePasswordView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'detail': 'Password changed successfully.'}, status=status.HTTP_200_OK)

class CheckAuthView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class AdminUserViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, permissions.IsAdminUser)
    queryset = User.objects.all().order_by('-date_joined')

    def get_serializer_class(self):
        if self.action == 'create':
            return AdminUserCreateSerializer
        return AdminUserSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        role = self.request.query_params.get('role')
        if role:
            queryset = queryset.filter(role__iexact=role)

        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            if is_active.lower() in ['true', '1']:
                queryset = queryset.filter(is_active=True)
            elif is_active.lower() in ['false', '0']:
                queryset = queryset.filter(is_active=False)

        search = self.request.query_params.get('search')
        if search:
            search = search.strip()
            queryset = queryset.filter(
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(username__icontains=search) |
                Q(email__icontains=search) |
                Q(phone_number__icontains=search) |
                Q(grade__icontains=search)
            )

        return queryset

    @action(detail=True, methods=['post'], url_path='toggle-status')
    def toggle_status(self, request, pk=None):
        user = self.get_object()
        # Prevent self-deactivation by admin
        if user == request.user:
            return Response(
                {'detail': 'You cannot deactivate your own administrative account.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        user.is_active = not user.is_active
        user.save()
        action_name = 'activated' if user.is_active else 'deactivated'
        return Response({
            'detail': f"User account {user.username} has been {action_name}.",
            'is_active': user.is_active,
            'user': AdminUserSerializer(user).data
        }, status=status.HTTP_200_OK)
