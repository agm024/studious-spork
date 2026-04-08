from django.db import models
from django.conf import settings


class WishlistItem(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="wishlist_items",
    )
    product_id = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "wishlist_items"
        unique_together = [("user", "product_id")]
        ordering = ["created_at"]
        indexes = [
            models.Index(fields=["user", "created_at"]),
            models.Index(fields=["product_id"]),
        ]

    def __str__(self):
        return f"WishlistItem(user={self.user_id}, product={self.product_id})"
