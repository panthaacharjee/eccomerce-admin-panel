export interface Product {
  _id: string;
  sku: string;
  ean?: string;
  title: string;
  description: string;
  price: number;
  cost_price?: number;
  currency: string;
  stock_quantity: number;
  images: ProductImage[];
  thumbnail: string;
  categories: Category;
  sizes: ProductSizes[];
  colors?: ProductColors[];
  weight: string;
  weight_unit: string;
  dimensions: {
    length: string;
    width: string;
    height: string;
    unit: string;
  };
  meta_title?: string;
  meta_description?: string;
  keywords: string[];
  status: string;
  visibility: string;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  view_count: number;
  purchase_count: number;
  review: ProductReviews[];
}

export interface ProductImage {
  id: string;
  url: string;
  altText: string;
  caption?: string;
  order: number;
  isPrimary: boolean;
}

export interface Category {
  main_category: string;
  sub_category: string;
}

export interface ProductColors {
  name: string;
  colorCode: string;
}

export interface ProductSizes {
  label: string;
  stock: number;
  price: number;
  costPrice?: number;
  stockQuantity: number;
  weight?: number;
  isDefault: boolean;
}

export interface ProductReviews {
  rating: number;
  image: string;
  comment: string;
  createdAt: Date;
}

export interface ProductState {
  status: boolean;
  loading: boolean;
  products: Product[] | null;
  error: string | null;
  success: string | null;
}
