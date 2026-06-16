import Settings from "@/model/Settings";

type CreateXoomSportsUserParams = {
  phone: string;
  membershipPlan: string;
  expiryDate?: string;
  reference: string;
  platform: string;
};

export async function createXoomSportsUser({
  phone,
  membershipPlan,
  expiryDate,
  reference,
  platform,
}: CreateXoomSportsUserParams) {
  try {
    const settings = await Settings.findOne({})
      .select("general.xoomSportsUrl")
      .lean();
    const baseUrl = settings?.general?.xoomSportsUrl;
    if (!baseUrl) return null;

    const url = new URL(`${baseUrl}/PaymentGateway/CreateNewUser`);
    url.searchParams.set("mode", "login");
    url.searchParams.set("MobileNumber", phone);
    url.searchParams.set("MembershipPlan", membershipPlan);
    if (expiryDate) url.searchParams.set("ExpiryDate", expiryDate);
    url.searchParams.set("Reference", reference);
    url.searchParams.set("Platform", platform);

    const res = await fetch(url.toString(), { method: "GET" });
    return await res.json();
    // return true;
  } catch (error) {
    return null;
  }
}
