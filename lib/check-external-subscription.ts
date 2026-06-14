import Settings from "@/model/Settings";

type CheckExternalSubscriptionParams = {
  phone: string;
  adAgencyCampaignTransactionId?: string;
  userIP?: string;
  ua?: string;
  userTelcoServiceId?: number;
  adAgencyCampaignId?: number;
};

export async function checkExternalSubscription({
  phone,
  adAgencyCampaignTransactionId,
  userIP,
  ua = "windows",
  userTelcoServiceId = 200,
  adAgencyCampaignId = 200,
}: CheckExternalSubscriptionParams) {
  try {
    const settings = await Settings.findOne({}).select("general.universalSubscriptionApiUrl").lean();
    const apiUrl = settings?.general?.universalSubscriptionApiUrl;
    if (!apiUrl) return null;
    const res = await fetch(
      `${apiUrl}/CheckSubscriberStatus`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          msisdn: phone,
          userTelcoServiceId,
          adAgencyCampaignId,
          adAgencyCampaignTransactionId,
          userIP,
          ua,
        }),
      },
    );

    return await res.json();
  } catch (error) {
    return null;
  }
}
