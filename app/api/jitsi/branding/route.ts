import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    logoImageUrl: "https://starix.tech/brand/starix-lockup.png",
    logoClickUrl: "https://starix.tech",
    backgroundColor: "#0a0a0b",
    premeetingBackground: "#0a0a0b",
    customTheme: {
      palette: {
        uiBackground: "#0a0a0b",
        ui01: "#101113",
        ui02: "#1a1b1e",
        action01: "#c8a24a",
        action01Hover: "#e2c377",
        action01Active: "#a98632",
        text01: "#f7f7f2",
        text02: "#c4c2ba",
        link01: "#d7b45d",
      },
    },
  }, { headers: { "Access-Control-Allow-Origin": "*", "Cache-Control": "public, max-age=300" } });
}
