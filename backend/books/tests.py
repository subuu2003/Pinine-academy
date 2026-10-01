from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from .models import Book

User = get_user_model()


class BookAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Create admin user
        self.admin_user = User.objects.create_superuser(
            username='adminuser',
            email='admin@pinine.com',
            password='AdminPassword123!',
            role='ADMIN'
        )

        # Create student user
        self.student_user = User.objects.create_user(
            username='studentuser',
            email='student@pinine.com',
            password='StudentPassword123!',
            role='STUDENT'
        )

        # Create sample books
        self.book1 = Book.objects.create(
            title='Physics for Class 11',
            author='Pinine Council',
            price=499.00,
            category='Class 11',
            subject='Physics',
            description='Kinematics, dynamics and wave mechanics.',
            is_bestseller=True
        )

        self.book2 = Book.objects.create(
            title='Chemistry for Class 12',
            author='Pinine Council',
            price=599.00,
            category='Class 12',
            subject='Chemistry',
            description='Organic synthesis and physical chemistry.'
        )

        self.book3 = Book.objects.create(
            title='JEE Advanced Mathematics Guide',
            author='Pinine Council',
            price=899.00,
            category='JEE Prep',
            subject='Mathematics',
            description='Calculus and coordinate geometry.'
        )

    def test_list_books_unauthenticated(self):
        """Anyone can browse the books catalog without logging in."""
        response = self.client.get('/api/books')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data.get('success'))
        self.assertEqual(response.data.get('count'), 3)
        self.assertEqual(len(response.data.get('data')), 3)

    def test_list_books_trailing_slash(self):
        """Both /api/books and /api/books/ work seamlessly."""
        response = self.client.get('/api/books/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data.get('count'), 3)

    def test_retrieve_book_detail(self):
        """Anyone can retrieve single book details."""
        response = self.client.get(f'/api/books/{self.book1.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data.get('data').get('title'), 'Physics for Class 11')
        self.assertEqual(response.data.get('data').get('price'), 499.0)

    def test_filter_books_by_category(self):
        """Filtering by category returns only matching books."""
        response = self.client.get('/api/books?category=Class 11')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data.get('count'), 1)
        self.assertEqual(response.data.get('data')[0]['title'], 'Physics for Class 11')

    def test_filter_books_by_subject(self):
        """Filtering by subject returns only matching books."""
        response = self.client.get('/api/books?subject=Mathematics')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data.get('count'), 1)
        self.assertEqual(response.data.get('data')[0]['subject'], 'Mathematics')

    def test_search_books(self):
        """Searching query returns books matching title, subject, or description."""
        response = self.client.get('/api/books?search=Calculus')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data.get('count'), 1)
        self.assertEqual(response.data.get('data')[0]['title'], 'JEE Advanced Mathematics Guide')

    def test_student_cannot_create_book(self):
        """Regular students cannot create books."""
        self.client.force_authenticate(user=self.student_user)
        payload = {
            'title': 'Unauthorized Book',
            'price': 100.0,
            'category': 'Class 10',
            'subject': 'Physics'
        }
        response = self.client.post('/api/books/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_create_book(self):
        """Admin users can add new books to the catalog."""
        self.client.force_authenticate(user=self.admin_user)
        payload = {
            'title': 'New Class 10 Biology',
            'author': 'Dr. Pinine',
            'price': 450.00,
            'category': 'Class 10',
            'subject': 'Biology',
            'description': 'Ecology and human genetics.'
        }
        response = self.client.post('/api/books/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data.get('success'))
        self.assertEqual(response.data.get('data')['title'], 'New Class 10 Biology')
        self.assertEqual(Book.objects.filter(title='New Class 10 Biology').count(), 1)

    def test_admin_can_update_book(self):
        """Admin users can update an existing book."""
        self.client.force_authenticate(user=self.admin_user)
        payload = {'price': 525.00}
        response = self.client.patch(f'/api/books/{self.book1.id}/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data.get('data')['price'], 525.0)

    def test_admin_can_delete_book(self):
        """Admin users can soft delete a book."""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.delete(f'/api/books/{self.book1.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.book1.refresh_from_db()
        self.assertTrue(self.book1.is_deleted)

        # Ensure it does not appear in public active books list
        list_response = self.client.get('/api/books')
        self.assertEqual(list_response.data.get('count'), 2)
