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
    const res = await fetch(
      `${process.env.UNIVERSAL_SUBSCRIPTION_API_URL}/CheckSubscriberStatus`,
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
