// کارت‌به‌کارت
export interface NumbersCard {
  id: number;
  business: number | null;
  num_code: string;
  name_bank: string;
  card_holder_name: string;
  description?: string;
  status: boolean;
}

export type CreateNumbersCardPayload = {
  num_code: string;
  name_bank: string;
  card_holder_name: string;
  description?: string;
  status?: boolean;
};

export type UpdateNumbersCardPayload = Partial<CreateNumbersCardPayload>;

// فیش پرداخت دستی
export type ManualPaymentStatus = "pending" | "approved" | "rejected";

export interface ManualPayment {
  id: number;
  user: number;
  business: number | null;
  appointment: number | null;
  amount: string | null;
  tracking_code: string;
  receipt_image: string | null;
  status: ManualPaymentStatus;
  owner_note: string;
  reviewed_by: number | null;
  reviewed_at: string | null;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  business_name: string;
}

export type CreateManualPaymentPayload = {
  business_code: string;
  amount: number;
  tracking_code: string;
  appointment?: number | null;
  receipt_image: File;
};

export type ReviewManualPaymentPayload = {
  status: "approved" | "rejected";
  owner_note?: string;
};

// QR
export interface QrResponse {
  business: {
    id: number;
    name: string;
    random_code: string;
    logo: string | null;
  };
  booking_url: string;
  qr_image_base64: string;
}
