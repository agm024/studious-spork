import ProductCard from "./ProductCard";

export default function Carousel({ products }) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-2 snap-x">
      {products.map((p) => (
        <div key={p.id} className="min-w-[280px] snap-start">
          <ProductCard product={p} />
        </div>
      ))}
    </div>
  );
}