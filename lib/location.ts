export async function getLocationFromIP(ip: string) {
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}`);
    const data = await res.json();
    return {
      country: data.country || "Country",
      city: data.city || "City",
      region: data.regionName || "Region",
    };
  } catch (e) {
    return {
      country: "Unknown",
      city: "Unknown",
      region: "",
    };
  }
}
