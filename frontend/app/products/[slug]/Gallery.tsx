"use client";

import { useState } from "react";

type GalleryProps = {
  mainImage: string;
  thumbnails: string[];
  productTitle: string;
};

export function Gallery({ mainImage, thumbnails, productTitle }: GalleryProps) {
  const [activeImage, setActiveImage] = useState(mainImage);

  return (
    <div className="pdp-gallery">
      <div className="pdp-main-image">
        <img src={activeImage} alt={`${productTitle} product`} />
      </div>
      <div className="pdp-thumbnails">
        {thumbnails.map((thumbnail, index) => (
          <button
            className={activeImage === thumbnail ? "active" : ""}
            key={thumbnail}
            aria-label={`View product image ${index + 1}`}
            onClick={() => setActiveImage(thumbnail)}
          >
            <img src={thumbnail} alt="" />
          </button>
        ))}
      </div>
    </div>
  );
}
