/* eslint-disable @next/next/no-img-element */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

async function getLogoSource() {
  const logoPath = path.join(process.cwd(), "public", "logo.jpg");
  const logoBuffer = await readFile(logoPath);
  return `data:image/jpeg;base64,${logoBuffer.toString("base64")}`;
}

export default async function AppleIcon() {
  const logoSource = await getLogoSource();

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(0,0,0,0)",
        }}
      >
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            borderRadius: "9999px",
            overflow: "hidden",
          }}
        >
          <img
            src={logoSource}
            alt="Sixteen Road"
            style={{
              height: "100%",
              width: "100%",
              objectFit: "cover",
              objectPosition: "center",
            }}
          />
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
