from rest_framework import serializers
from .models import Book


class BookSerializer(serializers.ModelSerializer):
    price = serializers.FloatField()

    class Meta:
        model = Book
        fields = [
            'id',
            'title',
            'author',
            'price',
            'category',
            'subject',
            'description',
            'image_url',
            'isbn',
            'pages',
            'publisher',
            'is_bestseller',
            'inStock',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
