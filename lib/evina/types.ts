export interface Country {
  name: string;
  flag: string;
  code: string;
  dialCode: string;
  min: number;
  max: number;
}

export interface PinRequestPayload {
  msisdn: string;
  userTelcoServiceId: number;
  adAgencyCampaignId: number;
  adAgencyCampaignTransactionId: string;
  userIP: string;
  ua: string;
}

export interface PinVerifyPayload {
  pin: string;
  msisdn: string;
  adAgencyCampaignTransactionId: string;
}

export interface ApiResponse {
  status: string;
  responseMessage?: string;
  message?: string;
  error?: string;
  errorCode?: number;
}

export type SubscriptionStep = "phone" | "pin" | "success";
