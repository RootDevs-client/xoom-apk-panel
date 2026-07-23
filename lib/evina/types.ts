export interface Country {
  name: string;
  flag: string;
  code: string;
  dialCode: string;
  min: number;
  max: number;
}

export interface GetEvinaJSPayload {
  msisdn: string;
  userTelcoServiceId: number;
  adAgencyCampaignId: number;
  adAgencyCampaignTransactionId: string;
  userIP: string;
  ua: string;
  telco: string;
}

export interface PinRequestPayload {
  msisdn: string;
  userTelcoServiceId: number;
  adAgencyCampaignId: number;
  adAgencyCampaignTransactionId: string;
  userIP: string;
  ua: string;
  telco: string;
}

export interface PinVerifyPayload {
  pin: string;
  msisdn: string;
  adAgencyCampaignTransactionId: string;
  telco: string;
}

export interface ApiResponse {
  status: string;
  responseMessage?: string;
  message?: string;
  error?: string;
  errorCode?: number;
}

export type SubscriptionStep =
  | "phone"
  | "confirm"
  | "pin"
  | "success"
  | "loading"
  | "apiError";
