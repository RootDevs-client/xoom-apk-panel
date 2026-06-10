export interface GeneralFormData {
  companyName: string;
  supportEmail: string;
  companyAddress: string;
  ownerName: string;
  ownerEmail: string;
  webviewUrl: string;
  webhookUrl: string;
  manual_flow_enabled: boolean;
  web_view_enabled: boolean;

  // ── New fields ────────────────────────────────────────────────────────────
  country: string;
  userTelcoServiceId: number | "";
  adAgencyCampaignId: number | "";
  sportsUrl: string;
  sportsToken: string;
  sports_url_enabled: boolean;
  redirect_url_enabled: boolean;
}
