import { getOpenSettings } from "@/actions/settings/settingsActions";
import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default async function Icon() {
  const generalSetting = await getOpenSettings();
  const appLogo = generalSetting?.data?.appLogo;

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {appLogo ? (
        <img src={appLogo} width={32} height={32} alt="App Logo" />
      ) : (
        <div
          style={{
            color: "white",
            fontSize: 28,
            fontWeight: "bold",
            fontFamily: "sans-serif",
          }}
        >
          TN
        </div>
      )}
    </div>,
    { ...size },
  );
}
