export interface EsewaSignatureParams {
  total_amount: string;
  transaction_uuid: string;
  product_code: string;
  secret: string;
}

export interface EsewaPaymentHashParams {
  amount: number;
  transaction_uuid: string;
}

export interface EsewaPaymentHashResponse {
  signature: string;
  signed_field_names: string;
}

export interface EsewaFormData {
  amount: string;
  tax_amount: string;
  total_amount: string;
  transaction_uuid: string;
  product_service_charge: string;
  product_delivery_charge: string;
  product_code: string;
  success_url: string;
  failure_url: string;
  signed_field_names: string;
  signature: string;
  secret: string;
}

export interface DecodedData {
  transaction_code: string;
  status: string;
  total_amount: number;
  transaction_uuid: string;
  signed_field_names: string;
  signature: string;
}

export interface EsewaPaymentResponse {
  status: string;
  transaction_uuid: string;
  total_amount: number;
}

export interface VerifyPaymentResponse {
  success: boolean;
  message?: string;
  response?: EsewaPaymentResponse;
  decodedData?: DecodedData;
}
