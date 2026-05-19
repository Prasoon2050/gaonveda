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
  ingredientSectionTitle?: string;
  ingredientSectionText?: string;
  price: number;
  salePrice?: number;
  originalPrice?: number;
  cartUnitPrice?: number;
  pack?: string;
  rating?: number;
  reviewCount?: number;
  sizeOptions?: string[];
  tags?: string[];
  images?: string[];
  ingredients?: Ingredient[];
  benefits?: string[];
  reviews?: Review[];
  stockQuantity?: number;
  lowStockThreshold?: number;
  stockStatus?: "healthy" | "low" | "out";
  isListed?: boolean;
  sortOrder?: number;
  priceLabel?: string;
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
  role?: "customer" | "admin";
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
  paymentMethod?: string;
  total: number;
  subtotal?: number;
  shipping?: number;
  totalLabel?: string;
  subtotalLabel?: string;
  shippingLabel?: string;
  createdAt?: string;
  user?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  shippingAddress?: UserAddress;
  items: Array<{
    productSlug: string;
    title: string;
    selectedSize?: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
};

export type AdminSummary = {
  stats: {
    orderCount: number;
    productCount: number;
    customerCount: number;
    revenue: number;
    revenueLabel: string;
  };
  recentOrders: Order[];
  lowStockProducts: Product[];
  orderStatuses: string[];
  paymentStatuses: string[];
};

export type AdminOrdersResponse = {
  items: Order[];
  orderStatuses: string[];
  paymentStatuses: string[];
};

export type AdminProductsResponse = {
  items: Product[];
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
