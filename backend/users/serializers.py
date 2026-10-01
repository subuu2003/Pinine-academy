from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db.models import Q
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name', 'full_name',
            'phone_number', 'role', 'is_student', 'is_staff', 'is_active',
            'grade', 'target_exam', 'school_or_college', 'city', 'address',
            'date_joined', 'last_login'
        )
        read_only_fields = ('id', 'full_name', 'is_staff', 'date_joined', 'last_login')

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    name = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = (
            'username', 'name', 'password', 'email', 'first_name', 'last_name',
            'phone_number', 'grade', 'target_exam', 'school_or_college', 'city', 'address'
        )
        extra_kwargs = {
            'username': {'required': False},
            'email': {'required': True},
            'phone_number': {'required': True},
        }

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value.lower()

    def validate_phone_number(self, value):
        if not value:
            raise serializers.ValidationError("Phone number is required.")
        cleaned = value.strip().replace(" ", "").replace("-", "")
        if User.objects.filter(phone_number=cleaned).exists():
            raise serializers.ValidationError("An account with this phone number already exists.")
        return cleaned

    def create(self, validated_data):
        password = validated_data.pop('password')
        name = validated_data.pop('name', '').strip()
        first_name = validated_data.get('first_name', '')
        last_name = validated_data.get('last_name', '')

        # Handle full name if passed
        if name and not first_name:
            parts = name.split(' ', 1)
            first_name = parts[0]
            last_name = parts[1] if len(parts) > 1 else ''
            validated_data['first_name'] = first_name
            validated_data['last_name'] = last_name

        # Auto-generate unique username if not provided
        email = validated_data.get('email', '')
        if not validated_data.get('username'):
            base_username = email.split('@')[0] if email else 'student'
            candidate = base_username
            counter = 1
            while User.objects.filter(username__iexact=candidate).exists():
                candidate = f"{base_username}{counter}"
                counter += 1
            validated_data['username'] = candidate

        validated_data['role'] = 'STUDENT'
        validated_data['is_student'] = True
        validated_data['is_active'] = True

        user = User.objects.create_user(
            password=password,
            **validated_data
        )
        return user

class LoginSerializer(serializers.Serializer):
    identifier = serializers.CharField(required=True, help_text="Email or Phone Number or Username")
    password = serializers.CharField(required=True, write_only=True)

    def validate(self, attrs):
        identifier = attrs.get('identifier', '').strip()
        password = attrs.get('password', '')

        # Lookup by Email (case-insensitive), Phone, or Username
        user = User.objects.filter(
            Q(email__iexact=identifier) |
            Q(phone_number=identifier) |
            Q(phone_number=identifier.replace(" ", "").replace("-", "")) |
            Q(username__iexact=identifier)
        ).first()

        if not user or not user.check_password(password):
            raise serializers.ValidationError({"detail": "Invalid credentials. Please verify your email/phone and password."})

        if not user.is_active:
            raise serializers.ValidationError({"detail": "Your account has been deactivated. Please contact Pinene Academy support.", "inactive": True})

        refresh = RefreshToken.for_user(user)

        return {
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }

class ProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            'first_name', 'last_name', 'phone_number',
            'grade', 'target_exam', 'school_or_college', 'city', 'address'
        )

    def validate_phone_number(self, value):
        if value:
            cleaned = value.strip().replace(" ", "").replace("-", "")
            user = self.instance
            if User.objects.filter(phone_number=cleaned).exclude(pk=user.pk).exists():
                raise serializers.ValidationError("This phone number is already registered by another account.")
            return cleaned
        return value

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=6)

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value

    def save(self):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user

class AdminUserSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name', 'full_name',
            'phone_number', 'role', 'is_student', 'is_staff', 'is_active',
            'grade', 'target_exam', 'school_or_college', 'city', 'address',
            'date_joined', 'last_login'
        )

class AdminUserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = (
            'username', 'password', 'email', 'first_name', 'last_name',
            'phone_number', 'role', 'is_active', 'grade', 'target_exam',
            'school_or_college', 'city', 'address'
        )

    def create(self, validated_data):
        password = validated_data.pop('password')
        role = validated_data.get('role', 'STUDENT')
        is_staff = (role == 'ADMIN')
        is_student = (role == 'STUDENT')

        user = User.objects.create_user(
            password=password,
            is_staff=is_staff,
            is_student=is_student,
            **validated_data
        )
        return user
