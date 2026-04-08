import json
from decimal import Decimal, InvalidOperation
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from products.models import Product


def _as_list(value):
    if isinstance(value, list):
        return [v for v in value if isinstance(v, str) and v.strip()]
    if isinstance(value, str) and value.strip():
        return [value.strip()]
    return []


def _to_decimal(value, default=Decimal("0.00")):
    try:
        return Decimal(str(value))
    except (InvalidOperation, TypeError, ValueError):
        return default


class Command(BaseCommand):
    help = "Import products from src/data/products.json into Product model for admin management."

    def add_arguments(self, parser):
        parser.add_argument(
            "--file",
            dest="file_path",
            default="",
            help="Optional path to products JSON file (defaults to ../src/data/products.json).",
        )
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Delete all existing products before importing.",
        )
        parser.add_argument(
            "--deactivate-missing",
            action="store_true",
            help="Set is_active=False for DB products not present in the JSON import list.",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        file_path = options.get("file_path")
        if file_path:
            json_path = Path(file_path).resolve()
        else:
            json_path = (Path(settings.BASE_DIR).parent / "src" / "data" / "products.json").resolve()

        if not json_path.exists():
            raise CommandError(f"Products JSON not found: {json_path}")

        try:
            payload = json.loads(json_path.read_text(encoding="utf-8"))
        except json.JSONDecodeError as exc:
            raise CommandError(f"Invalid JSON in {json_path}: {exc}") from exc

        if not isinstance(payload, list):
            raise CommandError("Products JSON must be an array of product objects.")

        if options.get("clear"):
            deleted, _ = Product.objects.all().delete()
            self.stdout.write(self.style.WARNING(f"Cleared existing products rows: {deleted}"))

        imported_ids = set()
        created_count = 0
        updated_count = 0
        skipped_count = 0

        for idx, row in enumerate(payload, start=1):
            if not isinstance(row, dict):
                skipped_count += 1
                self.stdout.write(self.style.WARNING(f"Row {idx}: skipped non-object entry"))
                continue

            name = str(row.get("name", "")).strip()
            if not name:
                skipped_count += 1
                self.stdout.write(self.style.WARNING(f"Row {idx}: skipped because 'name' is empty"))
                continue

            source_id = row.get("id")
            try:
                source_id = int(source_id) if source_id is not None else None
            except (TypeError, ValueError):
                source_id = None

            image_values = _as_list(row.get("image_url")) or _as_list(row.get("image"))
            gallery_values = _as_list(row.get("gallery_urls")) or _as_list(row.get("gallery"))

            if not gallery_values and image_values:
                gallery_values = image_values

            image_url = image_values[0] if image_values else (gallery_values[0] if gallery_values else "")

            defaults = {
                "name": name,
                "description": str(row.get("description", "") or "").strip(),
                "short_description": str(
                    row.get("short_description") or row.get("shortDescription") or ""
                ).strip(),
                "price": _to_decimal(row.get("price", 0)),
                "category": str(row.get("category", "") or "").strip(),
                "brand": str(row.get("brand", "") or "").strip(),
                "product_code": str(
                    row.get("product_code") or row.get("productCode") or ""
                ).strip(),
                "image_url": image_url,
                "gallery_urls": gallery_values,
                "features": row.get("features") if isinstance(row.get("features"), list) else [],
                "stock": int(row.get("stock", 10) or 0),
                "rating": _to_decimal(row.get("rating", 0), default=Decimal("0.0")),
                "is_active": bool(row.get("is_active", True)),
            }

            if source_id and source_id > 0:
                obj, created = Product.objects.update_or_create(id=source_id, defaults=defaults)
                imported_ids.add(obj.id)
            else:
                lookup = {"product_code": defaults["product_code"]} if defaults["product_code"] else {"name": name, "brand": defaults["brand"]}
                obj, created = Product.objects.update_or_create(**lookup, defaults=defaults)
                imported_ids.add(obj.id)

            if created:
                created_count += 1
            else:
                updated_count += 1

        if options.get("deactivate_missing") and imported_ids:
            Product.objects.exclude(id__in=imported_ids).update(is_active=False)

        self.stdout.write(self.style.SUCCESS("Products import completed."))
        self.stdout.write(f"Source file: {json_path}")
        self.stdout.write(f"Created: {created_count}")
        self.stdout.write(f"Updated: {updated_count}")
        self.stdout.write(f"Skipped: {skipped_count}")
