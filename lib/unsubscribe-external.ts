export async function unsubscribeExternal(
  phone: string,
  reference: string,
  platform: string,
) {
  try {
    const params = new URLSearchParams({
      mobilenumber: `+${phone}`,
      reference,
      Platform: platform || "XoomSports",
    });

    const res = await fetch(
      `https://lps.vclipss.com/bdGp/unsubsg.aspx?${params.toString()}`,
    );

    const text = await res.text();
    return { ok: res.ok, status: res.status, body: text };
  } catch {
    return null;
  }
}
