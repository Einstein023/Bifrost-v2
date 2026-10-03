import React from "react";
import { BadgeCheck, QrCode, ScanLine } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export default function QrDisplay({ userId, profile }) {
  if (!userId || !profile?.full_name) {
    return (
      <section className="pass-placeholder">
        <div>
          <span className="placeholder-icon"><QrCode aria-hidden="true" /></span>
          <h2 className="placeholder-title">Your pass is getting ready</h2>
          <p className="placeholder-copy">Save your profile to create your personal attendee badge.</p>
        </div>
      </section>
    );
  }

  // Payload protocol URI storing the unique user UID
  const qrPayload = `bifrost://connect/${userId}`;

  return (
    <section className="pass-panel">
      <div className="pass-card">
        <div className="pass-card-top">
          <div className="pass-label"><BadgeCheck aria-hidden="true" /> Attendee pass</div>
          <span className="pass-brand">BIFROST</span>
        </div>
        <div className="pass-identity">
          <p className="pass-name">{profile.full_name}</p>
          <p className="pass-headline">{profile.headline || "Bifrost attendee"}</p>
        </div>
        <div className="qr-wrap">
          <QRCodeSVG value={qrPayload} size={220} level="H" includeMargin />
        </div>
        <div className="pass-status"><ScanLine aria-hidden="true" /> Ready to connect</div>
      </div>
      <p className="pass-note">Your personal badge for meeting people at Bifrost.</p>
    </section>
  );
}