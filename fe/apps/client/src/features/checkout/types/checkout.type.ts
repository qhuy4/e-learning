export interface CreateOrderPayload {
  couponId?: number;
  items: {
    courseId: number;
    instructorId: number;
    unitPrice: number;
    finalPrice: number;
  }[];
}

export interface CreatePaymentPayload {
  orderId: number;
  gateway: string;
  amount: number;
  currency: string;
  description?: string;
}

export interface CreatePaymentResponse {
  id: number;
  orderId: number;
  gateway: string;
  amount: number;
  currency: string;
  status: string;
  transactionId: string;
  paymentUrl: string;
}
