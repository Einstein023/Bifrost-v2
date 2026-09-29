import React, { useState, useCallback } from "react";
import { BadgeCheck, ScanLine, Sparkles } from "lucide-react";
import ProfileForm from "./components/ProfileForm";
import QrDisplay from "./components/QrDisplay";
import QrScanner from "./components/QrScanner";

export default function App() {
  const [userId, setUserId] = useState(null);
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("badge"); // 'badge' or 'scan'

  const handleProfileSaved = useCallback((uid, profileData) => {
    setUserId(uid);
    setProfile(profileData);
  }, []);

  return (
    <div className="min-h-screen bg-[#f3f5f1] text-[#202a2a]">
      <header className="border-b border-[#e2e8e3] bg-white/90">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <a href="#main" className="group inline-flex items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#39766a]">
            <span className="grid size-10 place-items-center rounded-xl bg-[#214d45] text-white shadow-sm transition-transform duration-200 group-hover:-rotate-3 group-hover:scale-105">
              <Sparkles size={19} strokeWidth={1.8} />
            </span>
            <span className="font-[Manrope] text-lg font-extrabold tracking-normal">bifrost<span className="text-[#5c8b7e]">.</span></span>
          </a>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#e2e8e3] bg-[#f7f9f6] px-3 py-2 text-xs font-semibold text-[#5c6965]">
            <span className="size-2 rounded-full bg-[#6c9c81] ring-4 ring-[#e6f0e8]" />
            Attendee
          </div>
        </div>
      </header>

      <main id="main" className="mx-auto w-full max-w-6xl px-5 pb-14 pt-8 sm:px-8 sm:pt-12">
        <div className="mx-auto max-w-4xl animate-rise-in">
          <div className="mb-7 flex flex-col gap-6 sm:mb-9 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#68857c]">Your attendee space</p>
              <h1 className="font-[Manrope] text-3xl font-bold tracking-normal text-[#1d302d] sm:text-4xl">Meet in the moment.</h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-[#677570] sm:text-base">Your pass and connections, together in one place.</p>
            </div>
            <nav aria-label="Attendee views" className="grid grid-cols-2 gap-1 rounded-xl border border-[#dfe7e1] bg-[#e9eee9] p-1 md:min-w-67.5">
              <button
                type="button"
                aria-pressed={activeTab === "badge"}
                onClick={() => setActiveTab("badge")}
                className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#39766a] ${activeTab === "badge" ? "bg-white text-[#244d45] shadow-sm" : "text-[#64716c] hover:text-[#294a44]"}`}
              >
                <BadgeCheck size={17} /> My pass
              </button>
              <button
                type="button"
                aria-pressed={activeTab === "scan"}
                onClick={() => setActiveTab("scan")}
                className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#39766a] ${activeTab === "scan" ? "bg-white text-[#244d45] shadow-sm" : "text-[#64716c] hover:text-[#294a44]"}`}
              >
                <ScanLine size={17} /> Scan a pass
              </button>
            </nav>
          </div>

        {activeTab === "badge" ? (
          <div className="grid gap-5 md:grid-cols-[1.08fr_0.92fr] md:items-start">
            <ProfileForm onProfileSaved={handleProfileSaved} />
            <QrDisplay userId={userId} profile={profile} />
          </div>
        ) : (
          <QrScanner />
        )}
        </div>
      </main>
    </div>
  );
}