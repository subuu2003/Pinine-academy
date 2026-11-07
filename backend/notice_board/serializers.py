from rest_framework import serializers
from .models import Notice


class AdminNoticeSerializer(serializers.ModelSerializer):
    created_by_name = serializers.SerializerMethodField(read_only=True)
    effective_status = serializers.ReadOnlyField()
    is_active_published = serializers.ReadOnlyField()
    is_expired = serializers.ReadOnlyField()
    is_scheduled = serializers.ReadOnlyField()

    class Meta:
        model = Notice
        fields = [
            'id',
            'title',
            'short_description',
            'content',
            'category',
            'status',
            'is_published',
            'publish_date',
            'expiry_date',
            'is_deleted',
            'created_by',
            'created_by_name',
            'created_at',
            'updated_at',
            'effective_status',
            'is_active_published',
            'is_expired',
            'is_scheduled',
        ]
        read_only_fields = [
            'id',
            'created_by',
            'created_by_name',
            'created_at',
            'updated_at',
            'effective_status',
            'is_active_published',
            'is_expired',
            'is_scheduled',
        ]

    def get_created_by_name(self, obj):
        if obj.created_by:
            name = f"{obj.created_by.first_name} {obj.created_by.last_name}".strip()
            return name if name else obj.created_by.username
        return "Pinine Admin"

    def validate_title(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Notice title cannot be empty.")
        return value.strip()

    def validate_content(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Notice content cannot be empty.")
        return value.strip()

    def validate(self, attrs):
        publish_date = attrs.get('publish_date') or (self.instance.publish_date if self.instance else None)
        expiry_date = attrs.get('expiry_date') or (self.instance.expiry_date if self.instance else None)

        # In case expiry_date was explicitly passed as None to clear it:
        if 'expiry_date' in attrs and attrs['expiry_date'] is None:
            expiry_date = None

        if publish_date and expiry_date:
            if expiry_date <= publish_date:
                raise serializers.ValidationError({
                    'expiry_date': "Expiry date and time must be strictly after the publish date."
                })

        # Sync status and is_published if either is provided
        if 'status' in attrs:
            attrs['is_published'] = (attrs['status'] == Notice.STATUS_PUBLISHED)
        elif 'is_published' in attrs:
            attrs['status'] = Notice.STATUS_PUBLISHED if attrs['is_published'] else Notice.STATUS_DRAFT

        return attrs


class PublicNoticeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notice
        fields = [
            'id',
            'title',
            'short_description',
            'content',
            'category',
            'publish_date',
            'expiry_date',
            'created_at',
            'updated_at',
        ]
        read_only_fields = fields
