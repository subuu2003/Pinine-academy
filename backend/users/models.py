from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('ADMIN', 'Admin'),
        ('STUDENT', 'Student'),
    )

    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=20, unique=True, null=True, blank=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='STUDENT')
    
    # Required Profile Information for Students
    grade = models.CharField(max_length=50, blank=True, null=True, help_text="e.g. Class 9, Class 10, Class 11, Class 12, JEE Prep")
    target_exam = models.CharField(max_length=50, blank=True, null=True, help_text="e.g. JEE Advanced, JEE Main, NEET, CBSE Boards")
    school_or_college = models.CharField(max_length=150, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    address = models.TextField(blank=True, null=True)

    is_student = models.BooleanField(default=True)
    is_teacher = models.BooleanField(default=False)

    @property
    def full_name(self):
        name = f"{self.first_name} {self.last_name}".strip()
        return name if name else self.username

    def save(self, *args, **kwargs):
        # Sync role with is_staff / is_student
        if self.is_staff or self.is_superuser:
            self.role = 'ADMIN'
            self.is_student = False
        elif self.role == 'ADMIN':
            self.is_staff = True
            self.is_student = False
        else:
            self.role = 'STUDENT'
            self.is_student = True
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.username} ({self.role})"
