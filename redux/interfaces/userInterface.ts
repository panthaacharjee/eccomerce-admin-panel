export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  account: string;
  authentication: {
    password: string;
    sessionToken: string;
  };
  image?: {
    public_id: string;
    url: string;
  };
  role: string;
  createdAt: Date;
  
  orders: [
    {
      items: [
        {
          productName: string;
          variantId: string;
          quantity: number;
          price: number;
          status: "delivered" | "cancelled" | "returned";
        },
      ];
      totalAmount: number;
      orderDate: Date;
      status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
      trackingNumber: string;
      estimatedDelivery: Date;
    },
  ];
}

export interface UserState {
  isAuthenticated: boolean;
  status: boolean;
  loading: boolean;
  user: User | null;
  users: User[];
  error: string | null;
  success: string | null;
}
