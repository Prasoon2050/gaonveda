export type Ingredient = {
  icon?: string;
  title: string;
  text: string;
};

export type Product = {
  slug: string;
  title: string;
  subtitle?: string;
  category: string;
  badge?: string;
  description?: string;
  storyTitle?: string;
  story?: string[];
  price: number;
  salePrice?: number;
  originalPrice?: number;
  cartUnitPrice?: number;
  pack?: string;
  rating?: number;
  reviewCount?: number;
  sizeOptions?: string[];
  tags?: string[];
  ingredients?: Ingredient[];
  benefits?: string[];
  reviews?: Review[];
  isListed?: boolean;
  sortOrder?: number;
};

export type UserAddress = {
  label?: string;
  recipient?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  isDefault?: boolean;
};

export type User = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatarInitials?: string;
  loyaltyPoints?: number;
  addresses?: UserAddress[];
  preferences?: {
    newsletter?: boolean;
    smsUpdates?: boolean;
  };
};

export type CartItem = {
  productSlug: string;
  quantity: number;
  selectedSize?: string;
  unitPrice: number;
  unitPriceLabel: string;
  lineTotal: number;
  lineTotalLabel: string;
  product: Product | null;
};

export type CartResponse = {
  userId?: string;
  items: CartItem[];
  totals: {
    itemCount: number;
    subtotal: number;
    subtotalLabel: string;
    shipping: number;
    shippingLabel: string;
    total: number;
    totalLabel: string;
  };
};

export type WishlistItem = {
  productSlug: string;
  status: "IN STOCK" | "LOW STOCK" | "OUT OF SEASON";
  actionLabel: string;
  addedAt?: string;
  product: Product | null;
};

export type WishlistResponse = {
  userId?: string;
  items: WishlistItem[];
};

export type Review = {
  _id: string;
  productSlug: string;
  rating: number;
  title: string;
  comment: string;
  verifiedPurchase?: boolean;
  createdAt?: string;
  user?: {
    name?: string;
    avatarInitials?: string;
  };
};

export type ReviewsResponse = {
  items: Review[];
  summary: {
    average: number;
    count: number;
  };
};

export type Order = {
  _id: string;
  orderNumber: string;
  status: string;
  paymentStatus?: string;
  total: number;
  totalLabel?: string;
  createdAt?: string;
  items: Array<{
    productSlug: string;
    title: string;
    selectedSize?: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
};

export type ProfileResponse = {
  user: User;
  stats: {
    cartItems: number;
    wishlistItems: number;
    orderCount: number;
    loyaltyPoints: number;
  };
  recentOrders: Order[];
};
