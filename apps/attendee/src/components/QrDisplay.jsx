import React from "react";
import { BadgeCheck, QrCode, ScanLine } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export default function QrDisplay({ userId, profile }) {
  if (!userId || !profile?.full_name) {
    return (
      <section className="grid min-h-72 place-items-center rounded-2xl border border-dashed border-[#ccd9d0] bg-[#edf2ed] p-6 text-center">
        <div>
          <span className="mx-auto mb-4 grid size-12 place-items-center rounded-2xl bg-white text-[#66877c] shadow-sm"><QrCode size={22} /></span>
          <h2 className="font-[Manrope] text-lg font-bold text-[#3b514a]">Your pass is getting ready</h2>
          <p className="mx-auto mt-2 max-w-xs text-sm leading-5 text-[#74817b]">Save your profile to create your personal attendee badge.</p>
        </div>
      </section>
    );
  }

  // Payload protocol URI storing the unique user UID
  const qrPayload = `bifrost://connect/${userId}`;

  return (
    <section className="relative overflow-hidden rounded-2xl border border-[#dce6de] bg-[#e9f0e9] p-5 shadow-[0_12px_36px_-28px_rgba(35,67,57,0.32)] sm:p-6">
      <div className="pointer-events-none absolute -right-12 -top-16 size-48 rounded-full border border-[#d7e4d8]" />
      <div className="pointer-events-none absolute -right-6 -top-10 size-36 rounded-full border border-[#d7e4d8]" />
      <div className="relative flex items-center justify-between">
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#618176]"><BadgeCheck size={16} /> Attendee pass</div>
        <span className="rounded-full border border-[#d2dfd4] bg-white/70 px-2.5 py-1 text-[11px] font-semibold text-[#688078]">BIFROST</span>
      </div>
      <div className="relative mt-6 rounded-xl border border-[#e4ebe5] bg-white p-4 shadow-[0_8px_24px_-18px_rgba(30,55,48,0.3)]">
        <p className="font-[Manrope] text-xl font-bold text-[#243b35]">{profile.full_name}</p>
        <p className="mt-1 min-h-5 text-sm text-[#718078]">{profile.headline || "Bifrost attendee"}</p>
        <div className="mx-auto my-5 grid w-fit place-items-center rounded-xl bg-white p-2 ring-1 ring-[#e8eeea]">
          <QRCodeSVG value={qrPayload} size={190} level="H" includeMargin />
        </div>
        <div className="flex items-center justify-center gap-2 text-xs font-medium text-[#718078]"><ScanLine size={15} className="text-[#578174]" /> Ready to connect</div>
      </div>
      <p className="relative mt-4 text-center text-xs leading-5 text-[#728078]">Your personal badge for meeting people at Bifrost.</p>
    </section>
  );
}