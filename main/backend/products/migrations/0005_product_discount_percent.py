import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("products", "0004_product_unit_product_unit_value"),
    ]

    operations = [
        migrations.AddField(
            model_name="product",
            name="discount_percent",
            field=models.PositiveSmallIntegerField(
                default=0,
                help_text="Discount percentage shown to users (0-90).",
                validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(90)],
            ),
        ),
    ]
