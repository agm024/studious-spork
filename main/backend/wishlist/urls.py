from django.urls import path
from . import views

urlpatterns = [
    path("", views.wishlist_list, name="wishlist-list"),
    path("toggle/", views.wishlist_toggle, name="wishlist-toggle"),
    path("sync/", views.wishlist_sync, name="wishlist-sync"),
]
