from django.urls import path
from . import views

urlpatterns = [
    path("signup/", views.signup, name="signup"),
    path("signin/", views.signin, name="signin"),
    path("me/", views.me, name="me"),
    path("me/update/", views.update_profile, name="update-profile"),
    path("me/delete/", views.delete_account, name="delete-account"),
]
