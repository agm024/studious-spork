from django.contrib import admin
from django.utils.html import format_html
from .models import Product


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = [
        "product_number",
        "name",
        "price",
        "discount_percent",
        "pack_size",
        "stock",
        "rating",
        "is_active",
        "image_preview",
        "created_at",
    ]
    list_filter = ["is_active", "created_at"]
    search_fields = ["name", "description"]
    list_editable = ["is_active", "stock", "price", "discount_percent"]
    readonly_fields = ["product_number", "created_at", "updated_at", "image_preview_large"]
    ordering = ["-created_at"]
    fieldsets = (
        ("Basic Info", {
            "fields": ("product_number", "name",  "is_active"),
        }),
        ("Pricing & Stock", {
            "fields": ("price", "discount_percent", "unit_value", "unit", "stock", "rating"),
        }),
        ("Description", {
            "fields": ("description", "features"),
        }),
        ("Images", {
            "fields": ("image_url", "image_preview_large", "gallery_urls"),
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at"),
            "classes": ("collapse",),
        }),
    )

    def save_model(self, request, obj, form, change):
        from orders.models import AdminLog
        if change:
            action = "product_update"
            description = f"Updated product: {obj.name} (ID: {obj.id})"
        else:
            action = "product_create"
            description = f"Created product: {obj.name} (ID: {obj.id})"

        super().save_model(request, obj, form, change)

        AdminLog.objects.create(
            user=request.user,
            action=action,
            target_model="Product",
            target_id=obj.id,
            description=description,
            ip_address=self._get_client_ip(request),
        )

    def delete_model(self, request, obj):
        from orders.models import AdminLog
        product_name = obj.name
        product_id = obj.id
        super().delete_model(request, obj)

        AdminLog.objects.create(
            user=request.user,
            action="product_delete",
            target_model="Product",
            target_id=product_id,
            description=f"Deleted product: {product_name} (ID: {product_id})",
            ip_address=self._get_client_ip(request),
        )

    def _get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0]
        return request.META.get('REMOTE_ADDR')

    def image_preview(self, obj):
        if obj.image_url:
            return format_html(
                '<img src="{}" style="width:50px;height:50px;object-fit:cover;border-radius:4px;" />',
                obj.image_url,
            )
        return "—"
    image_preview.short_description = "Image"

    def product_number(self, obj):
        return obj.id
    product_number.short_description = "Product #"

    def pack_size(self, obj):
        try:
            value = float(obj.unit_value or 1)
        except (TypeError, ValueError):
            value = 1
        text = str(int(value)) if value.is_integer() else f"{value:g}"
        return f"{text} {obj.get_unit_display()}"
    pack_size.short_description = "Pack Size"

    def image_preview_large(self, obj):
        if obj.image_url:
            return format_html(
                '<img src="{}" style="max-width:300px;max-height:300px;object-fit:contain;border-radius:8px;" />',
                obj.image_url,
            )
        return "No image"
    image_preview_large.short_description = "Image Preview"
