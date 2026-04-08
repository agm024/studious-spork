from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Product",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=255)),
                ("description", models.TextField(blank=True, default="")),
                ("short_description", models.CharField(blank=True, default="", max_length=500)),
                ("price", models.DecimalField(decimal_places=2, max_digits=10)),
                ("category", models.CharField(blank=True, default="", max_length=100)),
                ("brand", models.CharField(blank=True, default="", max_length=100)),
                ("product_code", models.CharField(blank=True, default="", max_length=100)),
                ("image_url", models.URLField(blank=True, default="", max_length=1000)),
                ("gallery_urls", models.JSONField(blank=True, default=list)),
                ("features", models.JSONField(blank=True, default=list)),
                ("stock", models.PositiveIntegerField(default=0)),
                ("rating", models.DecimalField(decimal_places=1, default=0, max_digits=3)),
                ("is_active", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={"db_table": "products", "ordering": ["-created_at"]},
        ),
    ]
