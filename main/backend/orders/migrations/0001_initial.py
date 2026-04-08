from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="Order",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("order_number", models.CharField(editable=False, max_length=20, unique=True)),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("pending", "Pending"),
                            ("processing", "Processing"),
                            ("shipped", "Shipped"),
                            ("out_for_delivery", "Out for Delivery"),
                            ("delivered", "Delivered"),
                            ("cancelled", "Cancelled"),
                        ],
                        default="pending",
                        max_length=20,
                    ),
                ),
                ("total_amount", models.DecimalField(decimal_places=2, max_digits=12)),
                ("shipping_name", models.CharField(max_length=200)),
                ("shipping_email", models.EmailField(max_length=254)),
                ("shipping_phone", models.CharField(blank=True, default="", max_length=20)),
                ("shipping_address", models.TextField()),
                ("shipping_city", models.CharField(max_length=100)),
                ("shipping_pincode", models.CharField(max_length=10)),
                ("shipping_state", models.CharField(blank=True, default="", max_length=100)),
                ("notes", models.TextField(blank=True, default="")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="orders",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={"db_table": "orders", "ordering": ["-created_at"]},
        ),
        migrations.CreateModel(
            name="OrderItem",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("product_id", models.PositiveIntegerField()),
                ("product_name", models.CharField(max_length=255)),
                ("product_image", models.URLField(blank=True, default="", max_length=1000)),
                ("price", models.DecimalField(decimal_places=2, max_digits=10)),
                ("quantity", models.PositiveIntegerField(default=1)),
                (
                    "order",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="items",
                        to="orders.order",
                    ),
                ),
            ],
            options={"db_table": "order_items"},
        ),
    ]
