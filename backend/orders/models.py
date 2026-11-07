import random
import string
from django.db import models
from django.conf import settings
from django.utils import timezone
from books.models import Book


def generate_order_number():
    """Generates unique human-readable order identifier, e.g. PIN-20261107-A9X2B4"""
    date_str = timezone.now().strftime('%Y%m%d')
    random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"PIN-{date_str}-{random_str}"


class Cart(models.Model):
    """Shopping cart attached to an authenticated student"""
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='cart'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Cart of {self.user.username}"

    @property
    def total_items(self):
        return sum(item.quantity for item in self.items.all())

    @property
    def subtotal(self):
        return sum(item.subtotal for item in self.items.all())


class CartItem(models.Model):
    """An individual book item in the user's shopping cart"""
    cart = models.ForeignKey(
        Cart,
        on_delete=models.CASCADE,
        related_name='items'
    )
    book = models.ForeignKey(
        Book,
        on_delete=models.CASCADE,
        related_name='cart_items'
    )
    quantity = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('cart', 'book')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.quantity}x {self.book.title}"

    @property
    def subtotal(self):
        return float(self.book.price) * self.quantity

    @property
    def is_in_stock(self):
        return self.book.inStock and (self.book.stock_quantity >= self.quantity)


class Order(models.Model):
    """Official student book publication order record"""

    ORDER_STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('CONFIRMED', 'Confirmed'),
        ('PROCESSING', 'Processing'),
        ('SHIPPED', 'Shipped'),
        ('DELIVERED', 'Delivered'),
        ('CANCELLED', 'Cancelled'),
    )

    PAYMENT_STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('PAID', 'Paid'),
        ('FAILED', 'Failed'),
        ('REFUNDED', 'Refunded'),
    )

    PAYMENT_METHOD_CHOICES = (
        ('COD', 'Cash on Delivery (Pay on Delivery)'),
        ('ONLINE', 'Online Payment (UPI / Card / NetBanking)'),
        ('BANK_TRANSFER', 'Direct Bank Transfer / NEFT'),
    )

    order_number = models.CharField(
        max_length=32,
        unique=True,
        db_index=True,
        default=generate_order_number
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='orders'
    )

    # Customer and delivery coordinates
    customer_name = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=20)
    email = models.EmailField(blank=True, default='')
    address_line1 = models.CharField(max_length=255)
    address_line2 = models.CharField(max_length=255, blank=True, default='')
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20)
    notes = models.TextField(blank=True, default='')

    # Monetary breakdown
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    shipping_charges = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)

    # Status tracking
    order_status = models.CharField(
        max_length=20,
        choices=ORDER_STATUS_CHOICES,
        default='PENDING',
        db_index=True
    )
    payment_status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS_CHOICES,
        default='PENDING',
        db_index=True
    )
    payment_method = models.CharField(
        max_length=50,
        choices=PAYMENT_METHOD_CHOICES,
        default='COD'
    )

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Order'
        verbose_name_plural = 'Orders'

    def __str__(self):
        return f"Order #{self.order_number} - {self.customer_name} (₹{self.total_amount})"

    @property
    def can_be_cancelled(self):
        """Students can cancel only if the order is still PENDING"""
        return self.order_status in ['PENDING', 'CONFIRMED']

    @property
    def total_items_count(self):
        return sum(item.quantity for item in self.items.all())


class OrderItem(models.Model):
    """Historical snapshot of an individual book item purchased in an order"""
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='items'
    )
    book = models.ForeignKey(
        Book,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='order_items'
    )

    # Historical immutable snapshot of book data at moment of checkout
    book_title = models.CharField(max_length=255)
    book_price = models.DecimalField(max_digits=8, decimal_places=2)
    book_category = models.CharField(max_length=50, blank=True, default='')
    book_subject = models.CharField(max_length=50, blank=True, default='')
    book_image_url = models.CharField(max_length=1000, blank=True, default='')

    quantity = models.PositiveIntegerField(default=1)
    item_subtotal = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        verbose_name = 'Order Item'
        verbose_name_plural = 'Order Items'

    def __str__(self):
        return f"{self.quantity}x {self.book_title} (Order #{self.order.order_number})"
