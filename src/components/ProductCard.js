// Update for optional color variants in ProductCard component
import React, { useState } from 'react';

const ProductCard = ({ product }) => {
    const [selectedVariant, setSelectedVariant] = useState(product.variants ? product.variants[0] : null);

    const handleVariantChange = (variant) => {
        setSelectedVariant(variant);
    };

    const displayImage = selectedVariant ? selectedVariant.image : product.image;

    return (
        <div className="product-card">
            <img src={displayImage} alt={product.name} />
            <h2>{product.name}</h2>
            {product.variants && (
                <div className="variants">
                    {product.variants.map((variant) => (
                        <button key={variant.id} onClick={() => handleVariantChange(variant)}>
                            {variant.color}
                        </button>
                    ))}
                </div>
            )}
            {/* Other card content */}
        </div>
    );
};

export default ProductCard;
