from rest_framework import serializers
from .models import Cart, CartItem, Order, OrderItem
from books.models import Book


class CartItemSerializer(serializers.ModelSerializer):
    book_id = serializers.IntegerField(source='book.id', read_only=True)
    book_title = serializers.CharField(source='book.title', read_only=True)
    book_price = serializers.FloatField(source='book.price', read_only=True)
    book_category = serializers.CharField(source='book.category', read_only=True)
    book_subject = serializers.CharField(source='book.subject', read_only=True)
    book_image_url = serializers.CharField(source='book.image_url', read_only=True)
    book_in_stock = serializers.BooleanField(source='book.inStock', read_only=True)
    book_available_stock = serializers.IntegerField(source='book.stock_quantity', read_only=True)
    subtotal = serializers.FloatField(read_only=True)
    is_in_stock = serializers.BooleanField(read_only=True)

    class Meta:
        model = CartItem
        fields = [
            'id',
            'book_id',
            'book_title',
            'book_price',
            'book_category',
            'book_subject',
            'book_image_url',
            'book_in_stock',
            'book_available_stock',
            'quantity',
            'subtotal',
            'is_in_stock',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_items = serializers.IntegerField(read_only=True)
    subtotal = serializers.FloatField(read_only=True)
    shipping_charges = serializers.SerializerMethodField()
    grand_total = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = [
            'id',
            'total_items',
            'subtotal',
            'shipping_charges',
            'grand_total',
            'items',
            'updated_at',
        ]

    def get_shipping_charges(self, obj):
        # Free shipping above ₹999, otherwise flat ₹49
        sub = float(obj.subtotal)
        if sub == 0:
            return 0.0
        return 0.0 if sub >= 999.0 else 49.0

    def get_grand_total(self, obj):
        sub = float(obj.subtotal)
        shipping = self.get_shipping_charges(obj)
        return round(sub + shipping, 2)


class OrderItemSerializer(serializers.ModelSerializer):
    book_price = serializers.FloatField()
    item_subtotal = serializers.FloatField()

    class Meta:
        model = OrderItem
        fields = [
            'id',
            'book',
            'book_title',
            'book_price',
            'book_category',
            'book_subject',
            'book_image_url',
            'quantity',
            'item_subtotal',
        ]
        read_only_fields = ['id']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    subtotal = serializers.FloatField()
    shipping_charges = serializers.FloatField()
    total_amount = serializers.FloatField()
    can_be_cancelled = serializers.BooleanField(read_only=True)
    total_items_count = serializers.IntegerField(read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id',
            'order_number',
            'user',
            'user_username',
            'user_email',
            'customer_name',
            'phone_number',
            'email',
            'address_line1',
            'address_line2',
            'city',
            'state',
            'postal_code',
            'notes',
            'subtotal',
            'shipping_charges',
            'total_amount',
            'order_status',
            'payment_status',
            'payment_method',
            'can_be_cancelled',
            'total_items_count',
            'created_at',
            'updated_at',
            'items',
        ]
        read_only_fields = [
            'id',
            'order_number',
            'user',
            'subtotal',
            'shipping_charges',
            'total_amount',
            'created_at',
            'updated_at',
        ]


class CheckoutItemInputSerializer(serializers.Serializer):
    book_id = serializers.IntegerField(required=True)
    quantity = serializers.IntegerField(min_value=1, default=1)


class CheckoutRequestSerializer(serializers.Serializer):
    customer_name = serializers.CharField(max_length=255, required=True)
    phone_number = serializers.CharField(max_length=20, required=True)
    email = serializers.EmailField(required=False, allow_blank=True)
    address_line1 = serializers.CharField(max_length=255, required=True)
    address_line2 = serializers.CharField(max_length=255, required=False, allow_blank=True, default='')
    city = serializers.CharField(max_length=100, required=True)
    state = serializers.CharField(max_length=100, required=True)
    postal_code = serializers.CharField(max_length=20, required=True)
    notes = serializers.CharField(required=False, allow_blank=True, default='')
    payment_method = serializers.ChoiceField(
        choices=['COD', 'ONLINE', 'BANK_TRANSFER'],
        default='COD'
    )
    # Optional direct items payload (if provided, checks out these items; if omitted, checks out current user's backend Cart)
    items = CheckoutItemInputSerializer(many=True, required=False)

    def validate_phone_number(self, value):
        cleaned = ''.join(filter(str.isdigit, value))
        if len(cleaned) < 10:
            raise serializers.ValidationError("Please provide a valid phone number with at least 10 digits.")
        return value

    def validate_postal_code(self, value):
        cleaned = value.strip()
        if len(cleaned) < 4:
            raise serializers.ValidationError("Please provide a valid postal/PIN code.")
        return cleaned
