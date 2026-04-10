export interface Order {
    orderId: string;
    items: OrderItem[];
    deliveryInfo: DeliveryInfo;
    billingInfo: BillingInfo | null;
    shippingMethod: ShippingMethod;
    paymentMethod: PaymentMethod;
    mobilePayment?: MobilePaymentDetails | null;
    bankPayment?: BankPaymentDetails | null;
    subtotal: number;
    shippingFee: number;
    tax: number;
    total: number;
    orderDate: string;
    currency: string;
    orderStatus?: OrderStatus;
    userId?: string;
    notes?: string;
    trackingNumber?: string;
    estimatedDelivery?: string;
    updatedAt?: string;

}

export interface OrderItem {
    id: string;
    title: string;
    price: number;
    quantity: number;
    selectedSize?: string;
    thumbnail: string;
    total: number;
}


export interface DeliveryInfo {
    firstName: string;
    lastName: string;
    country: string;
    streetAddress: string;
    apartment?: string;
    city: string;
    district: string;
    postcode: string;
    phone: string;
    email: string;
    orderNotes?: string;
}

export interface BillingInfo {
    sameAsDelivery: boolean;
    firstName: string;
    lastName: string;
    streetAddress: string;
    apartment?: string;
    city: string;
    district: string;
    postcode: string;
    phone: string;
    email: string;
}

export interface ShippingMethod {
    id: string;
    name: string;
    description: string;
    fee: number;
    estimatedDelivery: string;
}

export interface PaymentMethod {
    id: string;
    name: string;
    type: "cod" | "mobile" | "bank";
    details?: {
        provider?: string;
        accountNumber?: string;
        transactionId?: string;
    };
}

export interface MobilePaymentDetails {
    mobileNumber: string;
    transactionId: string;
    provider: "bkash" | "nagad" | "rocket";
    amount: number;
    paymentTime?: string;
    verified?: boolean;
}

export interface BankPaymentDetails {
    bankName: "dutch" | "city" | "brac";
    accountNumber: string;
    transactionId: string;
    accountHolderName?: string;
    routingNumber?: string;
    branch?: string;
    amount: number;
    verified?: boolean;
}

export type OrderStatus =
    | "pending"
    | "processing"
    | "confirmed"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "refunded";


export interface OrderState {
  status: boolean;
  loading: boolean;
  orders: Order[] | null;
  
  error: string | null;
  success: string | null;
}
