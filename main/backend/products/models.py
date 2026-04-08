from django.db import models
from django.db import transaction
from django.core.cache import cache
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal, InvalidOperation


class Product(models.Model):
    UNIT_ML = "ml"
    UNIT_L = "l"
    UNIT_G = "g"
    UNIT_KG = "kg"
    UNIT_PC = "pc"
    UNIT_CHOICES = [
        (UNIT_ML, "ml"),
        (UNIT_L, "L"),
        (UNIT_G, "g"),
        (UNIT_KG, "kg"),
        (UNIT_PC, "piece"),
    ]

    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, default="")
    short_description = models.CharField(max_length=500, blank=True, default="")
    price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=100, blank=True, default="", db_index=True)
    brand = models.CharField(max_length=100, blank=True, default="", db_index=True)
    product_code = models.CharField(max_length=100, blank=True, default="", db_index=True)
    image_url = models.URLField(max_length=1000, blank=True, default="")
    gallery_urls = models.JSONField(default=list, blank=True)
    features = models.JSONField(default=list, blank=True)
    size_stock = models.JSONField(default=dict, blank=True)
    unit_value = models.DecimalField(max_digits=10, decimal_places=3, default=1)
    unit = models.CharField(max_length=10, choices=UNIT_CHOICES, default=UNIT_PC)
    stock = models.PositiveIntegerField(default=0)
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=0)
    discount_percent = models.PositiveSmallIntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(90)],
        help_text="Discount percentage shown to users (0-90).",
    )
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "products"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["is_active", "created_at"]),
            models.Index(fields=["is_active", "category"]),
            models.Index(fields=["is_active", "brand"]),
        ]

    def save(self, *args, **kwargs):
        try:
            normalized_unit_value = Decimal(str(self.unit_value or "1"))
        except (InvalidOperation, TypeError, ValueError):
            normalized_unit_value = Decimal("1")
        if normalized_unit_value <= 0:
            normalized_unit_value = Decimal("1")
        self.unit_value = normalized_unit_value

        # Keep size-wise shoe inventory normalized and aligned with aggregate stock.
        category_name = (self.category or "").strip().lower()
        is_shoe = "shoe" in category_name
        normalized = {}
        raw_size_stock = self.size_stock if isinstance(self.size_stock, dict) else {}
        for size, qty in raw_size_stock.items():
            size_key = str(size).strip()
            if not size_key:
                continue
            try:
                normalized_qty = max(0, int(qty))
            except (TypeError, ValueError):
                continue
            normalized[size_key] = normalized_qty

        if is_shoe:
            self.size_stock = normalized
            self.stock = sum(normalized.values())
        else:
            self.size_stock = {}

        # Reuse the smallest missing positive ID when creating a new product.
        if self.pk is None:
            with transaction.atomic():
                existing_ids = self.__class__.objects.order_by("id").values_list("id", flat=True)
                next_id = 1
                for existing_id in existing_ids:
                    if existing_id != next_id:
                        break
                    next_id += 1
                self.pk = next_id
                super().save(*args, **kwargs)
                cache.clear()
            return

        super().save(*args, **kwargs)
        cache.clear()

    def __str__(self):
        return self.name
