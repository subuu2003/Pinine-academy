from decimal import Decimal
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from books.models import Book
from orders.models import Cart, CartItem, Order, OrderItem

User = get_user_model()


class OrdersAndCartTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Create student user
        self.student = User.objects.create_user(
            username='student1',
            email='student1@example.com',
            password='testpassword123',
            role='STUDENT',
            phone_number='9876543210'
        )

        # Create second student user
        self.student2 = User.objects.create_user(
            username='student2',
            email='student2@example.com',
            password='testpassword123',
            role='STUDENT',
            phone_number='9876543211'
        )

        # Create admin user
        self.admin = User.objects.create_superuser(
            username='admin1',
            email='admin1@example.com',
            password='adminpassword123',
            role='ADMIN',
            phone_number='9876543212'
        )

        # Create sample books with limited stock
        self.book1 = Book.objects.create(
            title="Physics Foundation Class 11",
            price=Decimal('500.00'),
            category="Class 11",
            subject="Physics",
            stock_quantity=5,
            inStock=True
        )

        self.book2 = Book.objects.create(
            title="Chemistry Advanced Class 12",
            price=Decimal('600.00'),
            category="Class 12",
            subject="Chemistry",
            stock_quantity=10,
            inStock=True
        )

    def test_cart_operations(self):
        self.client.force_authenticate(user=self.student)

        # 1. Add book1 to cart (quantity 2)
        res = self.client.post('/api/cart/add/', {'book_id': self.book1.id, 'quantity': 2}, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['data']['total_items'], 2)
        self.assertEqual(res.data['data']['subtotal'], 1000.0)

        # 2. Update quantity to 4
        res = self.client.post('/api/cart/update/', {'book_id': self.book1.id, 'quantity': 4}, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['data']['total_items'], 4)

        # 3. Add beyond stock (5 available, requested 4+2=6) -> should fail
        res = self.client.post('/api/cart/add/', {'book_id': self.book1.id, 'quantity': 2}, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

        # 4. Remove book from cart
        res = self.client.post('/api/cart/remove/', {'book_id': self.book1.id}, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['data']['total_items'], 0)

    def test_checkout_and_stock_management(self):
        self.client.force_authenticate(user=self.student)

        payload = {
            "customer_name": "Subrat Kumar",
            "phone_number": "9861247722",
            "email": "subrat@example.com",
            "address_line1": "Plot 123, Green Garden",
            "city": "Bhubaneswar",
            "state": "Odisha",
            "postal_code": "751024",
            "items": [
                {"book_id": self.book1.id, "quantity": 3},
                {"book_id": self.book2.id, "quantity": 2}
            ]
        }

        # Subtotal = 3*500 + 2*600 = 1500 + 1200 = 2700. Free shipping above 999.
        res = self.client.post('/api/orders/checkout/', payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        order_data = res.data['data']
        self.assertEqual(order_data['subtotal'], 2700.0)
        self.assertEqual(order_data['shipping_charges'], 0.0)
        self.assertEqual(order_data['total_amount'], 2700.0)
        self.assertEqual(order_data['order_status'], 'CONFIRMED')

        # Verify stock was decremented safely
        self.book1.refresh_from_db()
        self.book2.refresh_from_db()
        self.assertEqual(self.book1.stock_quantity, 2)  # 5 - 3 = 2
        self.assertEqual(self.book2.stock_quantity, 8)  # 10 - 2 = 8

        # Try purchasing more than available stock (now 2 available, try buying 3)
        oversell_payload = {
            "customer_name": "Test User",
            "phone_number": "9861247722",
            "address_line1": "Plot 456",
            "city": "Cuttack",
            "state": "Odisha",
            "postal_code": "753001",
            "items": [{"book_id": self.book1.id, "quantity": 3}]
        }
        res_fail = self.client.post('/api/orders/checkout/', oversell_payload, format='json')
        self.assertEqual(res_fail.status_code, status.HTTP_400_BAD_REQUEST)

    def test_order_ownership_and_cancellation(self):
        # Student 1 places an order
        self.client.force_authenticate(user=self.student)
        payload = {
            "customer_name": "Subrat Kumar",
            "phone_number": "9861247722",
            "address_line1": "Plot 123",
            "city": "Bhubaneswar",
            "state": "Odisha",
            "postal_code": "751024",
            "items": [{"book_id": self.book1.id, "quantity": 2}]
        }
        order_res = self.client.post('/api/orders/checkout/', payload, format='json')
        order_id = order_res.data['data']['id']
        self.book1.refresh_from_db()
        self.assertEqual(self.book1.stock_quantity, 3)

        # Student 2 tries to view Student 1's order -> Should be 404 (not in queryset)
        self.client.force_authenticate(user=self.student2)
        res = self.client.get(f'/api/orders/{order_id}/')
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

        # Student 1 cancels their own order
        self.client.force_authenticate(user=self.student)
        cancel_res = self.client.post(f'/api/orders/{order_id}/cancel/')
        self.assertEqual(cancel_res.status_code, status.HTTP_200_OK)
        self.assertEqual(cancel_res.data['data']['order_status'], 'CANCELLED')

        # Verify stock was restored
        self.book1.refresh_from_db()
        self.assertEqual(self.book1.stock_quantity, 5)  # Restored 3 + 2 = 5
