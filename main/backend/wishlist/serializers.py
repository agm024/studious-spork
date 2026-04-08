from rest_framework import serializers


class ToggleWishlistSerializer(serializers.Serializer):
    productId = serializers.IntegerField(min_value=1)


class SyncWishlistSerializer(serializers.Serializer):
    productIds = serializers.ListField(
        child=serializers.IntegerField(min_value=1),
        allow_empty=True,
    )
