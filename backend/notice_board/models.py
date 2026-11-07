from django.db import models
from django.conf import settings
from django.utils import timezone
from django.core.exceptions import ValidationError


class NoticeQuerySet(models.QuerySet):
    def active(self):
        """Non-deleted notices."""
        return self.filter(is_deleted=False)

    def published(self):
        """Notices marked as published and not deleted."""
        return self.active().filter(is_published=True, status='PUBLISHED')

    def drafts(self):
        """Notices marked as draft and not deleted."""
        return self.active().filter(models.Q(is_published=False) | models.Q(status='DRAFT'))

    def live(self, at_time=None):
        """
        Active and published notices visible to students/public:
        - is_deleted is False
        - is_published is True and status is PUBLISHED
        - publish_date <= now
        - expiry_date is null OR expiry_date > now
        """
        if at_time is None:
            at_time = timezone.now()
        return self.published().filter(
            publish_date__lte=at_time
        ).filter(
            models.Q(expiry_date__isnull=True) | models.Q(expiry_date__gt=at_time)
        )

    def expired(self, at_time=None):
        """Expired notices."""
        if at_time is None:
            at_time = timezone.now()
        return self.active().filter(
            expiry_date__isnull=False,
            expiry_date__lte=at_time
        )

    def scheduled(self, at_time=None):
        """Published notices scheduled for future publication."""
        if at_time is None:
            at_time = timezone.now()
        return self.published().filter(
            publish_date__gt=at_time
        )


class NoticeManager(models.Manager):
    def get_queryset(self):
        return NoticeQuerySet(self.model, using=self._db)

    def active(self):
        return self.get_queryset().active()

    def published(self):
        return self.get_queryset().published()

    def drafts(self):
        return self.get_queryset().drafts()

    def live(self, at_time=None):
        return self.get_queryset().live(at_time)

    def expired(self, at_time=None):
        return self.get_queryset().expired(at_time)

    def scheduled(self, at_time=None):
        return self.get_queryset().scheduled(at_time)


class Notice(models.Model):
    CATEGORY_GENERAL = 'GENERAL'
    CATEGORY_EXAMINATION = 'EXAMINATION'
    CATEGORY_RESULT = 'RESULT'
    CATEGORY_ADMISSION = 'ADMISSION'
    CATEGORY_IMPORTANT = 'IMPORTANT'
    CATEGORY_OTHER = 'OTHER'

    CATEGORY_CHOICES = (
        (CATEGORY_GENERAL, 'General'),
        (CATEGORY_EXAMINATION, 'Examination'),
        (CATEGORY_RESULT, 'Result'),
        (CATEGORY_ADMISSION, 'Admission'),
        (CATEGORY_IMPORTANT, 'Important'),
        (CATEGORY_OTHER, 'Other'),
    )

    STATUS_DRAFT = 'DRAFT'
    STATUS_PUBLISHED = 'PUBLISHED'

    STATUS_CHOICES = (
        (STATUS_DRAFT, 'Draft'),
        (STATUS_PUBLISHED, 'Published'),
    )

    title = models.CharField(max_length=255, help_text="Notice Title")
    short_description = models.TextField(blank=True, default='', max_length=500, help_text="Brief summary/snippet")
    content = models.TextField(help_text="Detailed notice content / announcements")
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES, default=CATEGORY_GENERAL)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_DRAFT)
    is_published = models.BooleanField(default=False)
    publish_date = models.DateTimeField(default=timezone.now, help_text="Publication release date/time")
    expiry_date = models.DateTimeField(null=True, blank=True, help_text="Optional expiration date/time")

    is_deleted = models.BooleanField(default=False)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_notices'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = NoticeManager()

    class Meta:
        ordering = ['-publish_date', '-created_at']
        indexes = [
            models.Index(fields=['category']),
            models.Index(fields=['status', 'is_published']),
            models.Index(fields=['publish_date']),
            models.Index(fields=['expiry_date']),
            models.Index(fields=['is_deleted']),
        ]

    def __str__(self):
        return f"[{self.category}] {self.title} ({self.status})"

    def clean(self):
        if self.status == self.STATUS_PUBLISHED:
            self.is_published = True
        elif self.status == self.STATUS_DRAFT:
            self.is_published = False

        if self.publish_date and self.expiry_date:
            if self.expiry_date <= self.publish_date:
                raise ValidationError({'expiry_date': "Expiry date must be strictly after the publish date."})

    def save(self, *args, **kwargs):
        if self.status == self.STATUS_PUBLISHED:
            self.is_published = True
        else:
            self.status = self.STATUS_DRAFT
            self.is_published = False
        self.clean()
        super().save(*args, **kwargs)

    @property
    def is_active_published(self):
        """True if the notice is currently published, live, and not expired."""
        if self.is_deleted or not self.is_published or self.status != self.STATUS_PUBLISHED:
            return False
        now = timezone.now()
        if self.publish_date > now:
            return False
        if self.expiry_date and self.expiry_date <= now:
            return False
        return True

    @property
    def is_expired(self):
        """True if the notice has an expiry date that has passed."""
        if not self.expiry_date:
            return False
        return timezone.now() >= self.expiry_date

    @property
    def is_scheduled(self):
        """True if published with a future publish date."""
        return self.is_published and self.publish_date > timezone.now()

    @property
    def effective_status(self):
        """
        Detailed status for admin reporting:
        - DRAFT
        - SCHEDULED
        - EXPIRED
        - ACTIVE
        """
        if self.is_deleted:
            return 'DELETED'
        if not self.is_published or self.status == self.STATUS_DRAFT:
            return 'DRAFT'
        now = timezone.now()
        if self.publish_date > now:
            return 'SCHEDULED'
        if self.expiry_date and self.expiry_date <= now:
            return 'EXPIRED'
        return 'ACTIVE'
