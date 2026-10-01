from django.contrib import admin
from .models import Examination

@admin.register(Examination)
class ExaminationAdmin(admin.ModelAdmin):
    list_display = (
        'title', 
        'exam_date', 
        'start_time', 
        'duration_minutes', 
        'publication_status', 
        'current_status_display',
        'is_available_display',
        'is_deleted'
    )
    list_filter = ('publication_status', 'is_published', 'is_deleted', 'exam_date')
    search_fields = ('title', 'description')
    readonly_fields = ('start_datetime', 'end_datetime', 'created_at', 'updated_at')

    def current_status_display(self, obj):
        return obj.current_status
    current_status_display.short_description = 'Status'

    def is_available_display(self, obj):
        return obj.is_available
    is_available_display.boolean = True
    is_available_display.short_description = 'Available Now'
