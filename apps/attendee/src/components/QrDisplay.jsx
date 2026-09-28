import React from "react";
import { QRCodeSVG } from "qrcode.react";

export default function QrDisplay({ userId, profile }) {
  if (!userId || !profile?.full_name) {
    return <p style={{ padding: 20 }}>Save your profile above to generate your QR Code badge.</p>;
  }

  // Payload protocol URI storing the unique user UID
  const qrPayload = `bifrost://connect/${userId}`;

  return (
    <div style={{ textAlign: "center", padding: 20, border: "1px solid #ccc", borderRadius: 8, margin: 20 }}>
      <h3>{profile.full_name}</h3>
      <p style={{ color: "#666" }}>{profile.headline}</p>

      <div style={{ margin: "20px 0" }}>
        <QRCodeSVG value={qrPayload} size={200} level="H" includeMargin={true} />
      </div>

      <small style={{ color: "#888" }}>Show this badge to another Bifrost attendee to connect</small>
    </div>
  );
}