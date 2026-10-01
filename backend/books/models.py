from django.db import models


class Book(models.Model):
    CATEGORY_CHOICES = (
        ('Class 9', 'Class 9'),
        ('Class 10', 'Class 10'),
        ('Class 11', 'Class 11'),
        ('Class 12', 'Class 12'),
        ('JEE Prep', 'JEE Prep'),
    )

    SUBJECT_CHOICES = (
        ('Physics', 'Physics'),
        ('Chemistry', 'Chemistry'),
        ('Mathematics', 'Mathematics'),
        ('Biology', 'Biology'),
    )

    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255, default='PINENE ACADEMY')
    price = models.DecimalField(max_digits=8, decimal_places=2)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='JEE Prep')
    subject = models.CharField(max_length=50, choices=SUBJECT_CHOICES, default='Physics')
    description = models.TextField(blank=True, default='')
    image_url = models.CharField(max_length=1000, blank=True, default='')
    isbn = models.CharField(max_length=50, blank=True, default='')
    pages = models.PositiveIntegerField(null=True, blank=True)
    publisher = models.CharField(max_length=255, default='PINENE ACADEMY')
    is_bestseller = models.BooleanField(default=False)
    inStock = models.BooleanField(default=True)
    is_deleted = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Book'
        verbose_name_plural = 'Books'

    def __str__(self):
        return f"{self.title} ({self.category} - {self.subject})"
