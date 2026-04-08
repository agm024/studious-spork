from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import WishlistItem
from .serializers import ToggleWishlistSerializer, SyncWishlistSerializer


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def wishlist_list(request):
    ids = list(
        WishlistItem.objects.filter(user=request.user).values_list("product_id", flat=True)
    )
    return Response({"items": ids})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def wishlist_toggle(request):
    serializer = ToggleWishlistSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({"errors": serializer.errors}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

    product_id = serializer.validated_data["productId"]
    user = request.user

    item = WishlistItem.objects.filter(user=user, product_id=product_id).first()
    if item:
        item.delete()
        return Response({"action": "removed", "productId": product_id})

    WishlistItem.objects.create(user=user, product_id=product_id)
    return Response({"action": "added", "productId": product_id})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def wishlist_sync(request):
    serializer = SyncWishlistSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({"errors": serializer.errors}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

    product_ids = serializer.validated_data["productIds"]
    user = request.user

    # Replace existing wishlist with provided list
    WishlistItem.objects.filter(user=user).delete()
    if product_ids:
        WishlistItem.objects.bulk_create(
            [WishlistItem(user=user, product_id=pid) for pid in product_ids]
        )

    ids = list(
        WishlistItem.objects.filter(user=user).values_list("product_id", flat=True)
    )
    return Response({"items": ids})
