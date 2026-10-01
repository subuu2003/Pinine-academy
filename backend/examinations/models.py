from datetime import datetime, timedelta
from django.db import models
from django.conf import settings
from django.utils import timezone
from django.core.exceptions import ValidationError

class ExaminationQuerySet(models.QuerySet):
    def active(self):
        """Excludes soft-deleted examinations."""
        return self.filter(is_deleted=False)

    def published(self):
        """Only published, non-deleted examinations."""
        return self.active().filter(is_published=True)

    def draft(self):
        """Draft examinations."""
        return self.active().filter(is_published=False)

    def upcoming(self, at_time=None):
        """Examinations scheduled to start in the future."""
        if at_time is None:
            at_time = timezone.now()
        return self.filter(start_datetime__gt=at_time)

    def ongoing(self, at_time=None):
        """Examinations currently active (start <= now < end)."""
        if at_time is None:
            at_time = timezone.now()
        return self.filter(start_datetime__lte=at_time, end_datetime__gt=at_time)

    def completed(self, at_time=None):
        """Examinations whose duration has ended (now >= end)."""
        if at_time is None:
            at_time = timezone.now()
        return self.filter(end_datetime__lte=at_time)


class ExaminationManager(models.Manager):
    def get_queryset(self):
        return ExaminationQuerySet(self.model, using=self._db)

    def active(self):
        return self.get_queryset().active()

    def published(self):
        return self.get_queryset().published()

    def draft(self):
        return self.get_queryset().draft()

    def upcoming(self, at_time=None):
        return self.get_queryset().active().upcoming(at_time)

    def ongoing(self, at_time=None):
        return self.get_queryset().active().ongoing(at_time)

    def completed(self, at_time=None):
        return self.get_queryset().active().completed(at_time)


class Examination(models.Model):
    PUBLICATION_CHOICES = (
        ('DRAFT', 'Draft'),
        ('PUBLISHED', 'Published'),
    )

    title = models.CharField(max_length=255, help_text="Examination Title")
    description = models.TextField(blank=True, default='', help_text="Detailed examination description / instructions")
    
    # Schedule fields
    exam_date = models.DateField(help_text="Examination date (YYYY-MM-DD)")
    start_time = models.TimeField(help_text="Examination start time (HH:MM:SS)")
    duration_minutes = models.PositiveIntegerField(help_text="Examination duration in minutes (must be > 0)")
    
    # Computed timezone-aware datetime markers for performant querying and filtering
    start_datetime = models.DateTimeField(db_index=True, blank=True, null=True, help_text="Calculated aware start datetime")
    end_datetime = models.DateTimeField(db_index=True, blank=True, null=True, help_text="Calculated aware end datetime")

    # Publication state
    publication_status = models.CharField(
        max_length=20, 
        choices=PUBLICATION_CHOICES, 
        default='DRAFT',
        db_index=True,
        help_text="Current publication status"
    )
    is_published = models.BooleanField(
        default=False, 
        db_index=True,
        help_text="True if published and visible to students"
    )

    # Soft deletion
    is_deleted = models.BooleanField(
        default=False, 
        db_index=True, 
        help_text="Soft deletion flag to preserve referential integrity for future attempts/results"
    )

    # Audit tracking
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_examinations'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = ExaminationManager()
    all_objects = models.Manager() # Includes soft-deleted if ever needed

    class Meta:
        ordering = ['-exam_date', '-start_time', '-created_at']
        verbose_name = 'Examination'
        verbose_name_plural = 'Examinations'
        indexes = [
            models.Index(fields=['exam_date', 'start_time']),
            models.Index(fields=['start_datetime', 'end_datetime']),
            models.Index(fields=['is_published', 'is_deleted']),
        ]

    def __str__(self):
        return f"{self.title} ({self.exam_date} {self.start_time} - {self.publication_status})"

    def clean(self):
        super().clean()
        if not self.title or not self.title.strip():
            raise ValidationError({'title': 'Examination title is required.'})

        if self.duration_minutes is not None and self.duration_minutes <= 0:
            raise ValidationError({'duration_minutes': 'Duration must be greater than zero minutes.'})

        # Calculate datetimes to validate consistency
        if self.exam_date and self.start_time:
            naive_start = datetime.combine(self.exam_date, self.start_time)
            current_tz = timezone.get_current_timezone()
            aware_start = timezone.make_aware(naive_start, current_tz) if timezone.is_naive(naive_start) else naive_start

            # Check rules on existing records
            if self.pk:
                try:
                    original = Examination.objects.get(pk=self.pk)
                    orig_status = original.get_current_status()

                    # Sensible rule: Completed exam schedule cannot be retroactively modified
                    if orig_status == 'COMPLETED':
                        if (original.exam_date != self.exam_date or 
                            original.start_time != self.start_time or 
                            original.duration_minutes != self.duration_minutes):
                            raise ValidationError({
                                'schedule': 'Cannot modify the schedule (date, time, or duration) of an already completed examination.'
                            })

                    # Sensible rule: Ongoing exam start date/time cannot be shifted while active
                    elif orig_status == 'ONGOING':
                        if (original.exam_date != self.exam_date or original.start_time != self.start_time):
                            raise ValidationError({
                                'start_time': 'Cannot modify start date or start time of an examination that is currently ongoing.'
                            })
                except Examination.DoesNotExist:
                    pass

    def compute_datetimes(self):
        """Calculates start_datetime and end_datetime from exam_date, start_time and duration_minutes."""
        if self.exam_date and self.start_time:
            naive_dt = datetime.combine(self.exam_date, self.start_time)
            current_tz = timezone.get_current_timezone()
            self.start_datetime = timezone.make_aware(naive_dt, current_tz) if timezone.is_naive(naive_dt) else naive_dt
            
            if self.duration_minutes:
                self.end_datetime = self.start_datetime + timedelta(minutes=self.duration_minutes)

    def save(self, *args, **kwargs):
        # Sync is_published and publication_status
        if self.publication_status == 'PUBLISHED':
            self.is_published = True
        elif self.publication_status == 'DRAFT':
            self.is_published = False
        elif self.is_published:
            self.publication_status = 'PUBLISHED'
        else:
            self.publication_status = 'DRAFT'

        self.compute_datetimes()
        self.full_clean()
        super().save(*args, **kwargs)

    def get_current_status(self, at_time=None):
        """
        Determines dynamic status: UPCOMING, ONGOING, or COMPLETED.
        """
        if at_time is None:
            at_time = timezone.now()

        if not self.start_datetime or not self.end_datetime:
            self.compute_datetimes()

        if not self.start_datetime or not self.end_datetime:
            return 'UPCOMING'

        if at_time < self.start_datetime:
            return 'UPCOMING'
        elif self.start_datetime <= at_time < self.end_datetime:
            return 'ONGOING'
        else:
            return 'COMPLETED'

    @property
    def current_status(self):
        return self.get_current_status()

    @property
    def is_available(self):
        """
        True only if published AND current time is within [start_datetime, end_datetime).
        """
        return bool(self.is_published and not self.is_deleted and self.current_status == 'ONGOING')

    def soft_delete(self):
        """Soft deletes examination after checking status constraints."""
        if self.current_status == 'ONGOING':
            raise ValidationError("Cannot delete an examination that is currently ongoing.")
        self.is_deleted = True
        self.save(update_fields=['is_deleted', 'updated_at'])
