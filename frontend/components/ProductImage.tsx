import { productImage } from "../lib/images";
import type { Product } from "../lib/types";

type ProductImageProps = {
  product?: Pick<Product, "images"> | null;
  alt: string;
};

export function ProductImage({ product, alt }: ProductImageProps) {
  const image = product ? productImage(product) : undefined;

  if (image) {
    return <img src={image} alt={alt} />;
  }

  return (
    <span className="product-image-empty" aria-label="No product image">
      <span className="material-symbols-outlined">image</span>
    </span>
  );
}
