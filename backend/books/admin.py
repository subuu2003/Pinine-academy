from django.contrib import admin
from .models import Book


@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = (
        'title',
        'author',
        'price',
        'category',
        'subject',
        'is_bestseller',
        'inStock',
        'is_deleted',
        'created_at'
    )
    list_filter = ('category', 'subject', 'is_bestseller', 'inStock', 'is_deleted')
    search_fields = ('title', 'author', 'description')
    readonly_fields = ('created_at', 'updated_at')
