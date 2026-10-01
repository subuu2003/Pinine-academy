from datetime import timedelta, date, time
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status

from .models import Examination

User = get_user_model()

class ExaminationManagementTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Admin user
        self.admin = User.objects.create_user(
            username='admin_exam',
            email='admin_exam@pinene.com',
            password='AdminPassword123!',
            role='ADMIN',
            is_staff=True,
            is_active=True
        )

        # Student user
        self.student = User.objects.create_user(
            username='student_exam',
            email='student_exam@pinene.com',
            password='StudentPass123!',
            role='STUDENT',
            is_student=True,
            is_staff=False,
            is_active=True
        )

        # Base exam fixtures (Upcoming, Ongoing, Completed)
        now = timezone.now()

        # 1. Upcoming Published Exam (tomorrow)
        tomorrow = now + timedelta(days=1)
        self.upcoming_exam = Examination.objects.create(
            title='Physics Mock Test 1 - Mechanics',
            description='Comprehensive Class 11 Mechanics test.',
            exam_date=tomorrow.date(),
            start_time=tomorrow.time().replace(microsecond=0),
            duration_minutes=180,
            publication_status='PUBLISHED',
            created_by=self.admin
        )

        # 2. Ongoing Published Exam (started 30 mins ago, 120 mins duration)
        ongoing_start = now - timedelta(minutes=30)
        self.ongoing_exam = Examination.objects.create(
            title='Chemistry Diagnostic Test - Organic Basics',
            description='Stepwise mechanistic questions.',
            exam_date=ongoing_start.date(),
            start_time=ongoing_start.time().replace(microsecond=0),
            duration_minutes=120,
            publication_status='PUBLISHED',
            created_by=self.admin
        )

        # 3. Completed Published Exam (yesterday)
        yesterday = now - timedelta(days=1)
        self.completed_exam = Examination.objects.create(
            title='Mathematics Practice Test - Calculus',
            description='Integration and derivatives review.',
            exam_date=yesterday.date(),
            start_time=yesterday.time().replace(microsecond=0),
            duration_minutes=90,
            publication_status='PUBLISHED',
            created_by=self.admin
        )

        # 4. Draft Exam (future, but unpublished)
        next_week = now + timedelta(days=7)
        self.draft_exam = Examination.objects.create(
            title='Biology Chapter 1 - Cell Biology (Draft)',
            description='Unpublished draft exam.',
            exam_date=next_week.date(),
            start_time=next_week.time().replace(microsecond=0),
            duration_minutes=60,
            publication_status='DRAFT',
            created_by=self.admin
        )

    # ==========================================
    # SCHEDULE & DYNAMIC STATUS TESTS
    # ==========================================
    def test_schedule_status_calculation(self):
        """Verifies dynamic status and availability calculations."""
        # Upcoming
        self.assertEqual(self.upcoming_exam.current_status, 'UPCOMING')
        self.assertFalse(self.upcoming_exam.is_available)

        # Ongoing
        self.assertEqual(self.ongoing_exam.current_status, 'ONGOING')
        self.assertTrue(self.ongoing_exam.is_available)

        # Completed
        self.assertEqual(self.completed_exam.current_status, 'COMPLETED')
        self.assertFalse(self.completed_exam.is_available)

        # Draft (Even though future, unpublished)
        self.assertEqual(self.draft_exam.current_status, 'UPCOMING')
        self.assertFalse(self.draft_exam.is_available)
        self.assertFalse(self.draft_exam.is_published)

    # ==========================================
    # ADMIN CRUD & WORKFLOW TESTS
    # ==========================================
    def test_admin_can_create_examination(self):
        self.client.force_authenticate(user=self.admin)
        future_date = date.today() + timedelta(days=10)
        payload = {
            'title': 'JEE Advanced All India Mock Exam',
            'description': 'Full syllabus 300 marks simulation.',
            'exam_date': future_date.strftime('%Y-%m-%d'),
            'start_time': '09:00:00',
            'duration_minutes': 180,
            'publication_status': 'DRAFT'
        }
        res = self.client.post('/api/admin/examinations/', payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data['title'], payload['title'])
        self.assertEqual(res.data['publication_status'], 'DRAFT')
        self.assertFalse(res.data['is_published'])
        self.assertEqual(res.data['current_status'], 'UPCOMING')
        self.assertIn('start_datetime', res.data)
        self.assertIn('end_datetime', res.data)

    def test_admin_cannot_create_with_invalid_duration(self):
        self.client.force_authenticate(user=self.admin)
        payload = {
            'title': 'Invalid Exam',
            'exam_date': '2026-10-15',
            'start_time': '10:00:00',
            'duration_minutes': 0, # Invalid
        }
        res = self.client.post('/api/admin/examinations/', payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('duration_minutes', res.data)

    def test_admin_can_view_and_filter_examinations(self):
        self.client.force_authenticate(user=self.admin)

        # 1. All examinations
        res_all = self.client.get('/api/admin/examinations/')
        self.assertEqual(res_all.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(res_all.data), 4)

        # 2. Upcoming filter
        res_upcoming = self.client.get('/api/admin/examinations/?status=UPCOMING')
        self.assertEqual(res_upcoming.status_code, status.HTTP_200_OK)
        for exam in res_upcoming.data:
            self.assertEqual(exam['current_status'], 'UPCOMING')

        # 3. Ongoing filter
        res_ongoing = self.client.get('/api/admin/examinations/?status=ONGOING')
        self.assertEqual(res_ongoing.status_code, status.HTTP_200_OK)
        for exam in res_ongoing.data:
            self.assertEqual(exam['current_status'], 'ONGOING')

        # 4. Completed filter
        res_completed = self.client.get('/api/admin/examinations/?status=COMPLETED')
        self.assertEqual(res_completed.status_code, status.HTTP_200_OK)
        for exam in res_completed.data:
            self.assertEqual(exam['current_status'], 'COMPLETED')

        # 5. Stats endpoint
        res_stats = self.client.get('/api/admin/examinations/stats/')
        self.assertEqual(res_stats.status_code, status.HTTP_200_OK)
        self.assertIn('total', res_stats.data)
        self.assertIn('upcoming', res_stats.data)
        self.assertIn('ongoing', res_stats.data)
        self.assertIn('completed', res_stats.data)

    def test_admin_can_edit_examination(self):
        self.client.force_authenticate(user=self.admin)
        res = self.client.patch(f'/api/admin/examinations/{self.upcoming_exam.id}/', {
            'title': 'Updated Physics Mock 1'
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['title'], 'Updated Physics Mock 1')

    def test_admin_cannot_alter_completed_exam_schedule(self):
        self.client.force_authenticate(user=self.admin)
        res = self.client.patch(f'/api/admin/examinations/{self.completed_exam.id}/', {
            'duration_minutes': 240
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('schedule', str(res.data))

    def test_admin_publish_and_unpublish_actions(self):
        self.client.force_authenticate(user=self.admin)

        # Publish draft
        res_pub = self.client.post(f'/api/admin/examinations/{self.draft_exam.id}/publish/')
        self.assertEqual(res_pub.status_code, status.HTTP_200_OK)
        self.draft_exam.refresh_from_db()
        self.assertTrue(self.draft_exam.is_published)
        self.assertEqual(self.draft_exam.publication_status, 'PUBLISHED')

        # Unpublish
        res_unpub = self.client.post(f'/api/admin/examinations/{self.draft_exam.id}/unpublish/')
        self.assertEqual(res_unpub.status_code, status.HTTP_200_OK)
        self.draft_exam.refresh_from_db()
        self.assertFalse(self.draft_exam.is_published)
        self.assertEqual(self.draft_exam.publication_status, 'DRAFT')

    def test_admin_can_soft_delete_examination(self):
        self.client.force_authenticate(user=self.admin)
        res = self.client.delete(f'/api/admin/examinations/{self.draft_exam.id}/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.draft_exam.refresh_from_db()
        self.assertTrue(self.draft_exam.is_deleted)

    def test_admin_cannot_delete_ongoing_examination(self):
        self.client.force_authenticate(user=self.admin)
        res = self.client.delete(f'/api/admin/examinations/{self.ongoing_exam.id}/')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('ongoing', res.data['detail'].lower())

    # ==========================================
    # STUDENT PERMISSIONS & VISIBILITY TESTS
    # ==========================================
    def test_student_can_view_published_examinations(self):
        self.client.force_authenticate(user=self.student)
        res = self.client.get('/api/examinations/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        
        # Student should see published exams (upcoming, ongoing, completed)
        exam_ids = [e['id'] for e in res.data]
        self.assertIn(self.upcoming_exam.id, exam_ids)
        self.assertIn(self.ongoing_exam.id, exam_ids)
        self.assertIn(self.completed_exam.id, exam_ids)

        # Student MUST NEVER see draft exams
        self.assertNotIn(self.draft_exam.id, exam_ids)

    def test_student_cannot_access_unpublished_examination_detail(self):
        self.client.force_authenticate(user=self.student)
        res = self.client.get(f'/api/examinations/{self.draft_exam.id}/')
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    def test_student_can_view_published_examination_detail(self):
        self.client.force_authenticate(user=self.student)
        res = self.client.get(f'/api/examinations/{self.upcoming_exam.id}/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['title'], self.upcoming_exam.title)
        self.assertEqual(res.data['current_status'], 'UPCOMING')
        self.assertFalse(res.data['is_available'])
        self.assertIn('server_time', res.data)

    def test_student_can_filter_by_status(self):
        self.client.force_authenticate(user=self.student)

        # Upcoming
        res_up = self.client.get('/api/examinations/?status=UPCOMING')
        self.assertEqual(res_up.status_code, status.HTTP_200_OK)
        self.assertTrue(all(e['current_status'] == 'UPCOMING' for e in res_up.data))

        # Available
        res_av = self.client.get('/api/examinations/available/')
        self.assertEqual(res_av.status_code, status.HTTP_200_OK)
        self.assertTrue(all(e['current_status'] == 'ONGOING' for e in res_av.data))

        # Completed
        res_comp = self.client.get('/api/examinations/completed/')
        self.assertEqual(res_comp.status_code, status.HTTP_200_OK)
        self.assertTrue(all(e['current_status'] == 'COMPLETED' for e in res_comp.data))

    def test_student_cannot_modify_examinations(self):
        self.client.force_authenticate(user=self.student)

        # 1. Cannot Create
        res_post = self.client.post('/api/examinations/', {'title': 'Hacked Exam'})
        self.assertEqual(res_post.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

        # 2. Cannot Edit
        res_put = self.client.put(f'/api/examinations/{self.upcoming_exam.id}/', {'title': 'Hacked Title'})
        self.assertEqual(res_put.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

        # 3. Cannot Delete
        res_del = self.client.delete(f'/api/examinations/{self.upcoming_exam.id}/')
        self.assertEqual(res_del.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_student_cannot_access_admin_examination_apis(self):
        self.client.force_authenticate(user=self.student)

        res_list = self.client.get('/api/admin/examinations/')
        self.assertEqual(res_list.status_code, status.HTTP_403_FORBIDDEN)

        res_create = self.client.post('/api/admin/examinations/', {'title': 'Unauthorized'})
        self.assertEqual(res_create.status_code, status.HTTP_403_FORBIDDEN)

    def test_unauthenticated_user_cannot_access_examinations(self):
        # Admin endpoint
        res_admin = self.client.get('/api/admin/examinations/')
        self.assertEqual(res_admin.status_code, status.HTTP_401_UNAUTHORIZED)

        # Student endpoint
        res_student = self.client.get('/api/examinations/')
        self.assertEqual(res_student.status_code, status.HTTP_401_UNAUTHORIZED)
