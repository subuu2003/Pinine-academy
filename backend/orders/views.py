from decimal import Decimal
from django.db import transaction
from django.db.models import Q, Sum
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Cart, CartItem, Order, OrderItem
from .serializers import (
    CartSerializer,
    CartItemSerializer,
    OrderSerializer,
    CheckoutRequestSerializer
)
from books.models import Book


class CartView(APIView):
    """
    Shopping Cart API for authenticated students:
    - GET /api/cart/ : Retrieve current user's cart
    - POST /api/cart/add/ : Add book to cart
    - POST /api/cart/update/ : Update item quantity
    - POST /api/cart/remove/ : Remove item from cart
    - POST /api/cart/clear/ : Clear all items
    - POST /api/cart/sync/ : Sync local cart items upon login
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_or_create_cart(self, user):
        cart, _ = Cart.objects.get_or_create(user=user)
        return cart

    def get(self, request):
        cart = self.get_or_create_cart(request.user)
        serializer = CartSerializer(cart)
        return Response({
            "success": True,
            "data": serializer.data
        })

    def post(self, request, *args, **kwargs):
        """Dispatches sub-actions based on URL or 'action' field"""
        action_name = kwargs.get('action') or request.data.get('action') or request.query_params.get('action', 'add')
        
        if action_name == 'add':
            return self.add_item(request)
        elif action_name == 'update':
            return self.update_item(request)
        elif action_name == 'remove':
            return self.remove_item(request)
        elif action_name == 'clear':
            return self.clear_cart(request)
        elif action_name == 'sync':
            return self.sync_cart(request)
        
        return Response(
            {"success": False, "message": f"Unknown action '{action_name}'"},
            status=status.HTTP_400_BAD_REQUEST
        )

    def add_item(self, request):
        cart = self.get_or_create_cart(request.user)
        book_id = request.data.get('book_id')
        quantity = int(request.data.get('quantity', 1))

        if not book_id:
            return Response(
                {"success": False, "message": "book_id is required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        if quantity <= 0:
            return Response(
                {"success": False, "message": "Quantity must be at least 1."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            book = Book.objects.get(id=book_id, is_deleted=False)
        except Book.DoesNotExist:
            return Response(
                {"success": False, "message": "Book not found or unlisted."},
                status=status.HTTP_404_NOT_FOUND
            )

        if not book.inStock or book.stock_quantity <= 0:
            return Response(
                {"success": False, "message": f"'{book.title}' is currently out of stock."},
                status=status.HTTP_400_BAD_REQUEST
            )

        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            book=book,
            defaults={'quantity': quantity}
        )
        if not created:
            new_qty = cart_item.quantity + quantity
            if new_qty > book.stock_quantity:
                return Response({
                    "success": False,
                    "message": f"Cannot add {quantity} more. Only {book.stock_quantity} available in stock."
                }, status=status.HTTP_400_BAD_REQUEST)
            cart_item.quantity = new_qty
            cart_item.save()

        return Response({
            "success": True,
            "message": f"Added '{book.title}' to cart.",
            "data": CartSerializer(cart).data
        })

    def update_item(self, request):
        cart = self.get_or_create_cart(request.user)
        book_id = request.data.get('book_id')
        quantity = int(request.data.get('quantity', 1))

        if not book_id:
            return Response(
                {"success": False, "message": "book_id is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            item = CartItem.objects.get(cart=cart, book_id=book_id)
        except CartItem.DoesNotExist:
            return Response(
                {"success": False, "message": "Item not found in cart."},
                status=status.HTTP_404_NOT_FOUND
            )

        if quantity <= 0:
            item.delete()
            return Response({
                "success": True,
                "message": "Item removed from cart.",
                "data": CartSerializer(cart).data
            })

        if quantity > item.book.stock_quantity:
            return Response({
                "success": False,
                "message": f"Only {item.book.stock_quantity} copies available in stock."
            }, status=status.HTTP_400_BAD_REQUEST)

        item.quantity = quantity
        item.save()

        return Response({
            "success": True,
            "message": "Cart updated.",
            "data": CartSerializer(cart).data
        })

    def remove_item(self, request):
        cart = self.get_or_create_cart(request.user)
        book_id = request.data.get('book_id')

        CartItem.objects.filter(cart=cart, book_id=book_id).delete()
        return Response({
            "success": True,
            "message": "Item removed from cart.",
            "data": CartSerializer(cart).data
        })

    def clear_cart(self, request):
        cart = self.get_or_create_cart(request.user)
        cart.items.all().delete()
        return Response({
            "success": True,
            "message": "Cart cleared.",
            "data": CartSerializer(cart).data
        })

    def sync_cart(self, request):
        """Merges guest cart items from local storage into the user's DB cart"""
        cart = self.get_or_create_cart(request.user)
        items_payload = request.data.get('items', [])

        for item_data in items_payload:
            book_id = item_data.get('book_id') or item_data.get('id')
            qty = int(item_data.get('quantity', 1))
            if not book_id or qty <= 0:
                continue

            try:
                book = Book.objects.get(id=book_id, is_deleted=False)
                if not book.inStock or book.stock_quantity <= 0:
                    continue

                cart_item, created = CartItem.objects.get_or_create(
                    cart=cart,
                    book=book,
                    defaults={'quantity': min(qty, book.stock_quantity)}
                )
                if not created:
                    cart_item.quantity = min(cart_item.quantity + qty, book.stock_quantity)
                    cart_item.save()
            except Book.DoesNotExist:
                continue

        return Response({
            "success": True,
            "message": "Cart synchronized successfully.",
            "data": CartSerializer(cart).data
        })


class CheckoutView(APIView):
    """
    Handles checkout process with transaction safety and stock management:
    - POST /api/orders/checkout/
    """
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        serializer = CheckoutRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        items_input = data.get('items')
        cart, _ = Cart.objects.get_or_create(user=request.user)

        # 1. Determine checkout items: use provided items or backend cart
        checkout_items = []
        if items_input and len(items_input) > 0:
            for itm in items_input:
                checkout_items.append({
                    'book_id': itm['book_id'],
                    'quantity': itm['quantity']
                })
        else:
            cart_items = cart.items.select_related('book').all()
            if not cart_items.exists():
                return Response(
                    {"success": False, "message": "Your cart is empty. Please add books before checkout."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            for itm in cart_items:
                checkout_items.append({
                    'book_id': itm.book.id,
                    'quantity': itm.quantity
                })

        if not checkout_items:
            return Response(
                {"success": False, "message": "No items found for checkout."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 2. Lock and validate books with select_for_update() to prevent overselling
        book_ids = [ci['book_id'] for ci in checkout_items]
        locked_books = {
            b.id: b
            for b in Book.objects.select_for_update().filter(id__in=book_ids, is_deleted=False)
        }

        order_items_to_create = []
        subtotal = Decimal('0.00')

        for ci in checkout_items:
            b_id = ci['book_id']
            qty = ci['quantity']

            if b_id not in locked_books:
                return Response(
                    {"success": False, "message": f"Book with ID {b_id} is no longer available."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            book = locked_books[b_id]

            if not book.inStock or book.stock_quantity < qty:
                return Response({
                    "success": False,
                    "message": f"Insufficient stock for '{book.title}'. Available: {book.stock_quantity}, requested: {qty}."
                }, status=status.HTTP_400_BAD_REQUEST)

            # Calculate line subtotal server-side using active book price
            price = Decimal(str(book.price))
            line_subtotal = price * Decimal(str(qty))
            subtotal += line_subtotal

            order_items_to_create.append({
                'book': book,
                'book_title': book.title,
                'book_price': price,
                'book_category': book.category or '',
                'book_subject': book.subject or '',
                'book_image_url': book.image_url or '',
                'quantity': qty,
                'item_subtotal': line_subtotal,
            })

        # 3. Calculate shipping charges: free above ₹999, else flat ₹49
        shipping_charges = Decimal('0.00') if subtotal >= Decimal('999.00') else Decimal('49.00')
        grand_total = subtotal + shipping_charges

        # 4. Create Order
        order = Order.objects.create(
            user=request.user,
            customer_name=data['customer_name'].strip(),
            phone_number=data['phone_number'].strip(),
            email=data.get('email', '').strip() or request.user.email,
            address_line1=data['address_line1'].strip(),
            address_line2=data.get('address_line2', '').strip(),
            city=data['city'].strip(),
            state=data['state'].strip(),
            postal_code=data['postal_code'].strip(),
            notes=data.get('notes', '').strip(),
            subtotal=subtotal,
            shipping_charges=shipping_charges,
            total_amount=grand_total,
            order_status='CONFIRMED',
            payment_status='PENDING',
            payment_method=data.get('payment_method', 'COD')
        )

        # 5. Create OrderItems and decrement stock
        for oi_data in order_items_to_create:
            book = oi_data.pop('book')
            OrderItem.objects.create(
                order=order,
                book=book,
                **oi_data
            )
            # Safe stock decrement
            book.stock_quantity -= oi_data['quantity']
            if book.stock_quantity <= 0:
                book.inStock = False
            book.save()

        # 6. Clear user's Cart after successful order
        cart.items.all().delete()

        return Response({
            "success": True,
            "message": "Order placed successfully!",
            "data": OrderSerializer(order).data
        }, status=status.HTTP_201_CREATED)


class OrderViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Orders API:
    - Students view only their own orders
    - Admins can view and filter all orders
    - Detailed tracking and cancellation
    """
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Order.objects.prefetch_related('items').select_related('user')

        # Students can only view their own orders
        if not (user.is_staff or getattr(user, 'role', '') == 'ADMIN'):
            return queryset.filter(user=user)

        # Admin filters
        status_param = self.request.query_params.get('status')
        if status_param and status_param != 'ALL':
            queryset = queryset.filter(order_status__iexact=status_param)

        payment_param = self.request.query_params.get('payment_status')
        if payment_param and payment_param != 'ALL':
            queryset = queryset.filter(payment_status__iexact=payment_param)

        search = self.request.query_params.get('search')
        if search:
            search = search.strip()
            queryset = queryset.filter(
                Q(order_number__icontains=search) |
                Q(customer_name__icontains=search) |
                Q(phone_number__icontains=search) |
                Q(email__icontains=search)
            )

        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "success": True,
            "count": len(serializer.data),
            "data": serializer.data
        })

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({
            "success": True,
            "data": serializer.data
        })

    @action(detail=True, methods=['post'])
    @transaction.atomic
    def cancel(self, request, pk=None):
        """Allows cancelling an order and safely restoring stock"""
        order = self.get_object()
        user = request.user
        is_admin = user.is_staff or getattr(user, 'role', '') == 'ADMIN'

        # Student ownership check & pending validation
        if not is_admin:
            if order.user != user:
                return Response(
                    {"success": False, "message": "You cannot cancel this order."},
                    status=status.HTTP_403_FORBIDDEN
                )
            if not order.can_be_cancelled:
                return Response(
                    {"success": False, "message": f"Order #{order.order_number} is already {order.order_status} and cannot be cancelled."},
                    status=status.HTTP_400_BAD_REQUEST
                )

        if order.order_status == 'CANCELLED':
            return Response(
                {"success": False, "message": "Order is already cancelled."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Restore stock for each item in transaction
        for item in order.items.select_related('book').all():
            if item.book:
                book = Book.objects.select_for_update().get(id=item.book.id)
                book.stock_quantity += item.quantity
                book.inStock = True
                book.save()

        order.order_status = 'CANCELLED'
        order.save()

        return Response({
            "success": True,
            "message": f"Order #{order.order_number} has been cancelled and stock restored.",
            "data": OrderSerializer(order).data
        })

    @action(detail=True, methods=['patch'], permission_classes=[permissions.IsAdminUser])
    @transaction.atomic
    def update_status(self, request, pk=None):
        """Admin status update endpoint"""
        order = self.get_object()
        new_order_status = request.data.get('order_status')
        new_payment_status = request.data.get('payment_status')

        if new_order_status:
            valid_statuses = [c[0] for c in Order.ORDER_STATUS_CHOICES]
            if new_order_status not in valid_statuses:
                return Response(
                    {"success": False, "message": f"Invalid order status. Allowed: {valid_statuses}"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # If transitioning to CANCELLED from non-cancelled, restore stock
            if new_order_status == 'CANCELLED' and order.order_status != 'CANCELLED':
                for item in order.items.select_related('book').all():
                    if item.book:
                        book = Book.objects.select_for_update().get(id=item.book.id)
                        book.stock_quantity += item.quantity
                        book.inStock = True
                        book.save()

            order.order_status = new_order_status

        if new_payment_status:
            valid_payments = [c[0] for c in Order.PAYMENT_STATUS_CHOICES]
            if new_payment_status not in valid_payments:
                return Response(
                    {"success": False, "message": f"Invalid payment status. Allowed: {valid_payments}"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            order.payment_status = new_payment_status

        order.save()

        return Response({
            "success": True,
            "message": f"Order #{order.order_number} status updated.",
            "data": OrderSerializer(order).data
        })

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAdminUser])
    def admin_stats(self, request):
        """Returns executive metrics for Admin Orders Dashboard"""
        total_orders = Order.objects.count()
        completed_orders = Order.objects.filter(order_status='DELIVERED').count()
        pending_orders = Order.objects.filter(order_status__in=['PENDING', 'CONFIRMED', 'PROCESSING']).count()
        total_revenue = Order.objects.exclude(order_status='CANCELLED').aggregate(
            rev=Sum('total_amount')
        )['rev'] or Decimal('0.00')

        return Response({
            "success": True,
            "data": {
                "total_orders": total_orders,
                "completed_orders": completed_orders,
                "pending_orders": pending_orders,
                "total_revenue": float(total_revenue),
            }
        })
