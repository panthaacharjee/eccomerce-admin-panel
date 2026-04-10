export interface Customer {
  id: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  status: "active" | "inactive" | "banned";
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: string;
  joinDate: string;
  avatar?: string;
}

export interface CustomerFilters {
  search: string;
  status: string;
  dateRange: {
    from: string;
    to: string;
  };
  minOrders: number;
}

export interface CustomerStats {
  totalCustomers: number;
  activeCustomers: number;
  newCustomersThisMonth: number;
  averageOrderValue: number;
}

export interface OrderHistory {
  id: string;
  orderNumber: string;
  date: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  total: number;
  items: number;
}

export interface CustomerActivity {
  type: "login" | "order" | "review" | "profile_update";
  description: string;
  date: string;
  ip?: string;
}
