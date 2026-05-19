import type { Product } from "../lib/types";

type ProductPriceProps = {
  product: Pick<Product, "price" | "salePrice">;
  className?: string;
};

function formatPrice(value?: number) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function discountPercent(product: Pick<Product, "price" | "salePrice">) {
  if (!product.salePrice || product.salePrice >= product.price) return 0;
  return Math.round(((product.price - product.salePrice) / product.price) * 100);
}

export function ProductPrice({ product, className = "" }: ProductPriceProps) {
  const discount = discountPercent(product);
  const hasSale = discount > 0;

  return (
    <div className={`product-price ${hasSale ? "product-price-sale" : ""} ${className}`.trim()}>
      <strong>{formatPrice(hasSale ? product.salePrice : product.price)}</strong>
      {hasSale ? (
        <>
          <span>{formatPrice(product.price)}</span>
          <em>{discount}% off</em>
        </>
      ) : null}
    </div>
  );
}
