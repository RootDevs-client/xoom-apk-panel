import { Country } from "./types";

export const COUNTRIES: Country[] = [
  {
    name: "Bangladesh",
    flag: "🇧🇩",
    code: "BD",
    dialCode: "880",
    min: 10,
    max: 10,
  },
  { name: "Kuwait", flag: "🇰🇼", code: "KW", dialCode: "965", min: 8, max: 8 },
  { name: "Oman", flag: "🇴🇲", code: "OM", dialCode: "968", min: 8, max: 8 },
  { name: "Maldives", flag: "🇲🇻", code: "MV", dialCode: "960", min: 7, max: 7 },
  { name: "Bahrain", flag: "🇧🇭", code: "BH", dialCode: "973", min: 8, max: 8 },
];

export const API = {
  getEvinaJs: "https://universal-subscription-api.vclipss.com/getevinajs",
  pinRequest: "https://universal-subscription-api.vclipss.com/pinrequest",
  pinVerify: "https://universal-subscription-api.vclipss.com/pinverify",
};
