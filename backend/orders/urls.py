from django.urls import path, re_path, include
from rest_framework.routers import DefaultRouter
from .views import CartView, CheckoutView, OrderViewSet

router = DefaultRouter()
router.register(r'orders', OrderViewSet, basename='orders')

urlpatterns = [
    # Cart endpoints
    re_path(r'^cart/?$', CartView.as_view(), name='cart-base'),
    re_path(r'^cart/add/?$', CartView.as_view(), {'action': 'add'}, name='cart-add'),
    re_path(r'^cart/update/?$', CartView.as_view(), {'action': 'update'}, name='cart-update'),
    re_path(r'^cart/remove/?$', CartView.as_view(), {'action': 'remove'}, name='cart-remove'),
    re_path(r'^cart/clear/?$', CartView.as_view(), {'action': 'clear'}, name='cart-clear'),
    re_path(r'^cart/sync/?$', CartView.as_view(), {'action': 'sync'}, name='cart-sync'),

    # Checkout
    re_path(r'^orders/checkout/?$', CheckoutView.as_view(), name='orders-checkout'),

    # Direct routes for router
    path('', include(router.urls)),
]
