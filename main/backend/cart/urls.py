from django.urls import path
from . import views

urlpatterns = [
    path("", views.cart_list, name="cart-list"),
    path("sync/", views.cart_sync, name="cart-sync"),
    path("<int:product_id>/", views.cart_item, name="cart-item"),
]
