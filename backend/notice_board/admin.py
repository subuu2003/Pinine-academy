from django.contrib import admin
from .models import Notice


@admin.register(Notice)
class NoticeAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'status', 'is_published', 'publish_date', 'expiry_date', 'is_deleted', 'created_at')
    list_filter = ('category', 'status', 'is_published', 'is_deleted')
    search_fields = ('title', 'short_description', 'content')
    date_hierarchy = 'publish_date'
    ordering = ('-publish_date',)
