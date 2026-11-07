from datetime import timedelta
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.core.exceptions import ValidationError
from rest_framework.test import APIClient
from rest_framework import status

from .models import Notice

User = get_user_model()


class NoticeManagementTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Admin user
        self.admin = User.objects.create_user(
            username='admin_notice',
            email='admin_notice@pinene.com',
            password='AdminPassword123!',
            role='ADMIN',
            is_staff=True,
            is_active=True
        )

        # Student user
        self.student = User.objects.create_user(
            username='student_notice',
            email='student_notice@pinene.com',
            password='StudentPass123!',
            role='STUDENT',
            is_student=True,
            is_staff=False,
            is_active=True
        )

        now = timezone.now()

        # 1. Active published notice
        self.active_notice = Notice.objects.create(
            title='Annual Science Olympiad 2026',
            short_description='Registration is now open for classes 9 to 12.',
            content='Full details regarding the Annual Science Olympiad dates, rules, and syllabus.',
            category=Notice.CATEGORY_EXAMINATION,
            status=Notice.STATUS_PUBLISHED,
            is_published=True,
            publish_date=now - timedelta(days=1),
            expiry_date=now + timedelta(days=30),
            created_by=self.admin
        )

        # 2. Draft notice (not published)
        self.draft_notice = Notice.objects.create(
            title='Upcoming Summer Crash Course Announcement',
            short_description='Draft proposal for summer crash courses.',
            content='Internal notes for upcoming crash course schedules.',
            category=Notice.CATEGORY_GENERAL,
            status=Notice.STATUS_DRAFT,
            is_published=False,
            publish_date=now - timedelta(days=2),
            created_by=self.admin
        )

        # 3. Future scheduled notice (published, but publish_date in future)
        self.scheduled_notice = Notice.objects.create(
            title='Admissions 2027 Portal Launch',
            short_description='Portal goes live next month.',
            content='Details on new session admission procedures.',
            category=Notice.CATEGORY_ADMISSION,
            status=Notice.STATUS_PUBLISHED,
            is_published=True,
            publish_date=now + timedelta(days=5),
            expiry_date=now + timedelta(days=60),
            created_by=self.admin
        )

        # 4. Expired notice (published, but expiry_date in past)
        self.expired_notice = Notice.objects.create(
            title='Late Fee Waiver Deadline Passed',
            short_description='Previous term fee discount deadline.',
            content='This fee discount was applicable only till yesterday.',
            category=Notice.CATEGORY_IMPORTANT,
            status=Notice.STATUS_PUBLISHED,
            is_published=True,
            publish_date=now - timedelta(days=20),
            expiry_date=now - timedelta(days=2),
            created_by=self.admin
        )

        # 5. Soft-deleted notice
        self.deleted_notice = Notice.objects.create(
            title='Cancelled Circular',
            short_description='Mistaken notice.',
            content='Content here.',
            category=Notice.CATEGORY_OTHER,
            status=Notice.STATUS_PUBLISHED,
            is_published=True,
            is_deleted=True,
            publish_date=now - timedelta(days=1),
            created_by=self.admin
        )

    # ==========================================
    # Model & QuerySet Tests
    # ==========================================
    def test_model_properties_and_querysets(self):
        self.assertTrue(self.active_notice.is_active_published)
        self.assertFalse(self.active_notice.is_expired)
        self.assertFalse(self.active_notice.is_scheduled)
        self.assertEqual(self.active_notice.effective_status, 'ACTIVE')

        self.assertFalse(self.draft_notice.is_active_published)
        self.assertEqual(self.draft_notice.effective_status, 'DRAFT')

        self.assertFalse(self.scheduled_notice.is_active_published)
        self.assertTrue(self.scheduled_notice.is_scheduled)
        self.assertEqual(self.scheduled_notice.effective_status, 'SCHEDULED')

        self.assertFalse(self.expired_notice.is_active_published)
        self.assertTrue(self.expired_notice.is_expired)
        self.assertEqual(self.expired_notice.effective_status, 'EXPIRED')

        self.assertEqual(self.deleted_notice.effective_status, 'DELETED')

        # Live querySet should only contain active_notice
        live_ids = list(Notice.objects.live().values_list('id', flat=True))
        self.assertIn(self.active_notice.id, live_ids)
        self.assertNotIn(self.draft_notice.id, live_ids)
        self.assertNotIn(self.scheduled_notice.id, live_ids)
        self.assertNotIn(self.expired_notice.id, live_ids)
        self.assertNotIn(self.deleted_notice.id, live_ids)

    def test_expiry_date_validation(self):
        now = timezone.now()
        notice = Notice(
            title='Invalid Dates',
            content='Some content',
            category=Notice.CATEGORY_GENERAL,
            publish_date=now,
            expiry_date=now - timedelta(hours=1)
        )
        with self.assertRaises(ValidationError):
            notice.clean()

    # ==========================================
    # Admin Permission & CRUD Tests
    # ==========================================
    def test_unauthenticated_cannot_access_admin_api(self):
        res = self.client.get('/api/admin/notices/')
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_student_forbidden_from_admin_api(self):
        self.client.force_authenticate(user=self.student)
        res = self.client.get('/api/admin/notices/')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_list_all_notices(self):
        self.client.force_authenticate(user=self.admin)
        res = self.client.get('/api/admin/notices/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        # Should return active non-deleted (active_notice, draft_notice, scheduled_notice, expired_notice)
        ids = [item['id'] for item in res.data]
        self.assertIn(self.active_notice.id, ids)
        self.assertIn(self.draft_notice.id, ids)
        self.assertIn(self.scheduled_notice.id, ids)
        self.assertIn(self.expired_notice.id, ids)
        self.assertNotIn(self.deleted_notice.id, ids)

    def test_admin_can_create_notice(self):
        self.client.force_authenticate(user=self.admin)
        now = timezone.now()
        payload = {
            'title': 'Board Exam Timetable Released',
            'short_description': 'Check class 10 and 12 schedules.',
            'content': 'Timetables for CBSE and State board mock tests are now available.',
            'category': 'EXAMINATION',
            'status': 'DRAFT',
            'publish_date': (now + timedelta(days=1)).isoformat(),
            'expiry_date': (now + timedelta(days=30)).isoformat(),
        }
        res = self.client.post('/api/admin/notices/', payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        created_id = res.data['id']
        notice = Notice.objects.get(id=created_id)
        self.assertEqual(notice.title, payload['title'])
        self.assertEqual(notice.created_by, self.admin)
        self.assertFalse(notice.is_published)

    def test_admin_publish_unpublish_actions(self):
        self.client.force_authenticate(user=self.admin)
        # Publish draft
        res = self.client.post(f'/api/admin/notices/{self.draft_notice.id}/publish/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.draft_notice.refresh_from_db()
        self.assertTrue(self.draft_notice.is_published)
        self.assertEqual(self.draft_notice.status, 'PUBLISHED')

        # Unpublish active
        res = self.client.post(f'/api/admin/notices/{self.active_notice.id}/unpublish/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.active_notice.refresh_from_db()
        self.assertFalse(self.active_notice.is_published)
        self.assertEqual(self.active_notice.status, 'DRAFT')

    def test_admin_soft_delete(self):
        self.client.force_authenticate(user=self.admin)
        res = self.client.delete(f'/api/admin/notices/{self.active_notice.id}/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.active_notice.refresh_from_db()
        self.assertTrue(self.active_notice.is_deleted)

    def test_admin_stats(self):
        self.client.force_authenticate(user=self.admin)
        res = self.client.get('/api/admin/notices/stats/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('total', res.data)
        self.assertIn('published', res.data)
        self.assertIn('draft', res.data)
        self.assertIn('active', res.data)
        self.assertIn('expired', res.data)
        self.assertIn('scheduled', res.data)

    def test_admin_filtering_and_search(self):
        self.client.force_authenticate(user=self.admin)
        # Search
        res = self.client.get('/api/admin/notices/?search=Olympiad')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        ids = [item['id'] for item in res.data]
        self.assertIn(self.active_notice.id, ids)
        self.assertEqual(len(ids), 1)

        # Category filter
        res = self.client.get('/api/admin/notices/?category=ADMISSION')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        ids = [item['id'] for item in res.data]
        self.assertIn(self.scheduled_notice.id, ids)
        self.assertNotIn(self.active_notice.id, ids)

        # Status filter: DRAFT
        res = self.client.get('/api/admin/notices/?status=DRAFT')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        ids = [item['id'] for item in res.data]
        self.assertIn(self.draft_notice.id, ids)
        self.assertNotIn(self.active_notice.id, ids)

    # ==========================================
    # Public & Student API Tests
    # ==========================================
    def test_public_can_view_only_live_notices(self):
        # Unauthenticated request
        res = self.client.get('/api/notices/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        ids = [item['id'] for item in res.data]
        self.assertIn(self.active_notice.id, ids)
        # Must hide drafts, scheduled, expired, deleted
        self.assertNotIn(self.draft_notice.id, ids)
        self.assertNotIn(self.scheduled_notice.id, ids)
        self.assertNotIn(self.expired_notice.id, ids)
        self.assertNotIn(self.deleted_notice.id, ids)

    def test_public_cannot_retrieve_draft_or_expired_by_id(self):
        # Active notice retrieves fine
        res = self.client.get(f'/api/notices/{self.active_notice.id}/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        # Draft notice returns 404
        res = self.client.get(f'/api/notices/{self.draft_notice.id}/')
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

        # Expired notice returns 404
        res = self.client.get(f'/api/notices/{self.expired_notice.id}/')
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

        # Future notice returns 404
        res = self.client.get(f'/api/notices/{self.scheduled_notice.id}/')
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    def test_public_latest_endpoint(self):
        res = self.client.get('/api/notices/latest/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        ids = [item['id'] for item in res.data]
        self.assertIn(self.active_notice.id, ids)
        self.assertNotIn(self.draft_notice.id, ids)
