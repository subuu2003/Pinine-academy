from datetime import datetime, date, time
from rest_framework import serializers
from django.utils import timezone
from .models import Examination

class AdminExaminationSerializer(serializers.ModelSerializer):
    current_status = serializers.ReadOnlyField()
    is_available = serializers.ReadOnlyField()
    created_by_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Examination
        fields = [
            'id',
            'title',
            'description',
            'exam_date',
            'start_time',
            'duration_minutes',
            'start_datetime',
            'end_datetime',
            'publication_status',
            'is_published',
            'current_status',
            'is_available',
            'created_by',
            'created_by_name',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'start_datetime',
            'end_datetime',
            'current_status',
            'is_available',
            'created_by',
            'created_by_name',
            'created_at',
            'updated_at',
        ]

    def get_created_by_name(self, obj):
        if obj.created_by:
            return obj.created_by.get_full_name() or obj.created_by.username
        return 'System Admin'

    def validate_title(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Examination title is required.")
        return value.strip()

    def validate_duration_minutes(self, value):
        if value is None or value <= 0:
            raise serializers.ValidationError("Duration must be a positive integer greater than zero minutes.")
        if value > 1440: # 24 hours max
            raise serializers.ValidationError("Duration cannot exceed 1440 minutes (24 hours).")
        return value

    def validate(self, attrs):
        instance = getattr(self, 'instance', None)
        exam_date = attrs.get('exam_date', instance.exam_date if instance else None)
        start_time = attrs.get('start_time', instance.start_time if instance else None)
        duration_minutes = attrs.get('duration_minutes', instance.duration_minutes if instance else None)

        if not exam_date:
            raise serializers.ValidationError({'exam_date': 'Examination date is required.'})
        if not start_time:
            raise serializers.ValidationError({'start_time': 'Start time is required.'})
        if not duration_minutes:
            raise serializers.ValidationError({'duration_minutes': 'Duration is required.'})

        # Check existing instance status constraints
        if instance:
            status = instance.current_status
            if status == 'COMPLETED':
                if (exam_date != instance.exam_date or 
                    start_time != instance.start_time or 
                    duration_minutes != instance.duration_minutes):
                    raise serializers.ValidationError({
                        'schedule': 'Schedule (date, start time, duration) of an already completed examination cannot be modified.'
                    })
            elif status == 'ONGOING':
                if exam_date != instance.exam_date or start_time != instance.start_time:
                    raise serializers.ValidationError({
                        'start_time': 'Cannot modify the start date or time of an ongoing examination.'
                    })

        return attrs

    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            validated_data['created_by'] = request.user
        return super().create(validated_data)


class StudentExaminationSerializer(serializers.ModelSerializer):
    current_status = serializers.ReadOnlyField()
    is_available = serializers.ReadOnlyField()
    server_time = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Examination
        fields = [
            'id',
            'title',
            'description',
            'exam_date',
            'start_time',
            'duration_minutes',
            'start_datetime',
            'end_datetime',
            'current_status',
            'is_available',
            'server_time',
            'created_at',
        ]
        read_only_fields = fields

    def get_server_time(self, obj):
        return timezone.now()
