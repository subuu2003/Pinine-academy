from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

# Create your tests here.
User = get_user_model()

class UserManagementTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user(
            username='admin_subrat',
            email='admin@pinene.com',
            password='AdminPassword123!',
            role='ADMIN',
            is_staff=True,
            is_active=True
        )

    def test_student_registration(self):
        payload = {
            'name': 'Aarav Patel',
            'email': 'aarav@example.com',
            'phone_number': '9876543210',
            'password': 'StudentPass123!',
            'grade': 'Class 11',
            'target_exam': 'JEE Advanced',
            'school_or_college': 'Delhi Public School',
            'city': 'New Delhi'
        }
        res = self.client.post('/api/auth/register/', payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', res.data)
        self.assertIn('user', res.data)
        self.assertEqual(res.data['user']['email'], 'aarav@example.com')
        self.assertEqual(res.data['user']['role'], 'STUDENT')
        self.assertEqual(res.data['user']['is_active'], True)
        self.assertEqual(res.data['user']['grade'], 'Class 11')

    def test_dual_login_email_and_phone(self):
        # Create student
        student = User.objects.create_user(
            username='rohit123',
            email='rohit@example.com',
            phone_number='9123456780',
            password='Password123!',
            first_name='Rohit',
            last_name='Sharma',
            role='STUDENT',
            is_active=True
        )

        # 1. Login with Email
        res_email = self.client.post('/api/auth/login/', {
            'identifier': 'rohit@example.com',
            'password': 'Password123!'
        }, format='json')
        self.assertEqual(res_email.status_code, status.HTTP_200_OK)
        self.assertIn('access', res_email.data)
        self.assertEqual(res_email.data['user']['username'], 'rohit123')

        # 2. Login with Phone
        res_phone = self.client.post('/api/auth/login/', {
            'identifier': '9123456780',
            'password': 'Password123!'
        }, format='json')
        self.assertEqual(res_phone.status_code, status.HTTP_200_OK)
        self.assertIn('access', res_phone.data)
        self.assertEqual(res_phone.data['user']['username'], 'rohit123')

    def test_deactivated_student_cannot_login(self):
        # Create inactive student
        student = User.objects.create_user(
            username='inactive_student',
            email='inactive@example.com',
            phone_number='9998887776',
            password='Password123!',
            is_active=False
        )

        res = self.client.post('/api/auth/login/', {
            'identifier': 'inactive@example.com',
            'password': 'Password123!'
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)
        self.assertTrue(res.data.get('inactive'))

    def test_profile_view_and_update(self):
        student = User.objects.create_user(
            username='priya_p',
            email='priya@example.com',
            phone_number='9871112233',
            password='Password123!',
            first_name='Priya',
            last_name='Patel',
            grade='Class 10',
            is_active=True
        )
        self.client.force_authenticate(user=student)

        # View profile
        res_view = self.client.get('/api/auth/profile/')
        self.assertEqual(res_view.status_code, status.HTTP_200_OK)
        self.assertEqual(res_view.data['full_name'], 'Priya Patel')
        self.assertEqual(res_view.data['grade'], 'Class 10')

        # Update profile
        res_update = self.client.patch('/api/auth/profile/', {
            'grade': 'Class 11',
            'city': 'Mumbai'
        }, format='json')
        self.assertEqual(res_update.status_code, status.HTTP_200_OK)
        self.assertEqual(res_update.data['grade'], 'Class 11')
        self.assertEqual(res_update.data['city'], 'Mumbai')

    def test_change_password(self):
        student = User.objects.create_user(
            username='change_pass_user',
            email='change@example.com',
            password='OldPassword123!',
            is_active=True
        )
        self.client.force_authenticate(user=student)

        # Attempt with wrong old password
        res_fail = self.client.post('/api/auth/change-password/', {
            'old_password': 'WrongPassword',
            'new_password': 'NewPassword123!'
        }, format='json')
        self.assertEqual(res_fail.status_code, status.HTTP_400_BAD_REQUEST)

        # Attempt with correct old password
        res_success = self.client.post('/api/auth/change-password/', {
            'old_password': 'OldPassword123!',
            'new_password': 'NewPassword123!'
        }, format='json')
        self.assertEqual(res_success.status_code, status.HTTP_200_OK)

        # Verify new password
        student.refresh_from_db()
        self.assertTrue(student.check_password('NewPassword123!'))

    def test_admin_user_management_and_toggle_status(self):
        student = User.objects.create_user(
            username='managed_student',
            email='managed@example.com',
            phone_number='9870001122',
            password='Password123!',
            role='STUDENT',
            is_active=True
        )

        # Authenticate as admin
        self.client.force_authenticate(user=self.admin)

        # List users
        res_list = self.client.get('/api/admin/users/?role=STUDENT')
        self.assertEqual(res_list.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(res_list.data), 1)

        # Deactivate student
        res_toggle = self.client.post(f'/api/admin/users/{student.id}/toggle-status/')
        self.assertEqual(res_toggle.status_code, status.HTTP_200_OK)
        self.assertFalse(res_toggle.data['is_active'])

        student.refresh_from_db()
        self.assertFalse(student.is_active)

        # Reactivate student
        res_reactivate = self.client.post(f'/api/admin/users/{student.id}/toggle-status/')
        self.assertEqual(res_reactivate.status_code, status.HTTP_200_OK)
        self.assertTrue(res_reactivate.data['is_active'])

        student.refresh_from_db()
        self.assertTrue(student.is_active)
