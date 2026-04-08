from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from accounts.models import User
from .models import WishlistItem


def get_token(user):
    return str(RefreshToken.for_user(user).access_token)


class WishlistTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="wishlist@example.com", name="Wishlist User", password="Secure123"
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {get_token(self.user)}")
        self.list_url = reverse("wishlist-list")
        self.toggle_url = reverse("wishlist-toggle")
        self.sync_url = reverse("wishlist-sync")

    def test_get_empty_wishlist(self):
        res = self.client.get(self.list_url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["items"], [])

    def test_toggle_add(self):
        res = self.client.post(self.toggle_url, {"productId": 1}, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["action"], "added")
        self.assertTrue(WishlistItem.objects.filter(user=self.user, product_id=1).exists())

    def test_toggle_remove(self):
        WishlistItem.objects.create(user=self.user, product_id=2)
        res = self.client.post(self.toggle_url, {"productId": 2}, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["action"], "removed")
        self.assertFalse(WishlistItem.objects.filter(user=self.user, product_id=2).exists())

    def test_sync_replaces_wishlist(self):
        WishlistItem.objects.create(user=self.user, product_id=99)
        res = self.client.post(self.sync_url, {"productIds": [1, 2, 3]}, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertCountEqual(res.data["items"], [1, 2, 3])
        self.assertFalse(WishlistItem.objects.filter(user=self.user, product_id=99).exists())

    def test_sync_empty_clears(self):
        WishlistItem.objects.create(user=self.user, product_id=5)
        res = self.client.post(self.sync_url, {"productIds": []}, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["items"], [])

    def test_unauthenticated_access(self):
        self.client.credentials()
        res = self.client.get(self.list_url)
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_wishlist_is_isolated_per_user(self):
        other_user = User.objects.create_user(
            email="other-wishlist@example.com", name="Other Wishlist User", password="Secure123"
        )
        WishlistItem.objects.create(user=other_user, product_id=101)
        WishlistItem.objects.create(user=self.user, product_id=202)

        res = self.client.get(self.list_url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["items"], [202])
