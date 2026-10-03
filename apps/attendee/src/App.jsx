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
  const initials = profile?.full_name
    ?.trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "B";

  const navigation = (
    <>
      <button
        type="button"
        aria-pressed={activeTab === "badge"}
        onClick={() => setActiveTab("badge")}
        className="nav-button"
      >
        <BadgeCheck aria-hidden="true" /> My pass
      </button>
      <button
        type="button"
        aria-pressed={activeTab === "scan"}
        onClick={() => setActiveTab("scan")}
        className="nav-button"
      >
        <ScanLine aria-hidden="true" /> Scan badge
      </button>
    </>
  );

  return (
    <div className="attendee-app">
      <header className="app-header">
        <div className="header-inner">
          <a href="#main" className="brand" aria-label="Bifrost attendee home">
            <span className="brand-mark"><Sparkles aria-hidden="true" /></span>
            <span>bifrost<span className="brand-period">.</span></span>
          </a>
          <nav className="desktop-nav" aria-label="Attendee views">
            {navigation}
          </nav>
          <span className="header-avatar" aria-label={profile?.full_name || "Attendee profile"}>
            {initials}
          </span>
        </div>
      </header>

      <main id="main" className="app-main">
        <div className="page-heading">
          <div className="heading-copy">
            <p className="greeting">Your attendee space</p>
            <h1 className="page-title">
              {activeTab === "badge" ? "Your Bifrost pass" : "Scan a badge"}
            </h1>
            <p className="page-description">
              {activeTab === "badge"
                ? "Keep your badge ready and make your profile easy to share."
                : "Scan another attendee’s badge to view their profile."}
            </p>
          </div>
        </div>

        {activeTab === "badge" ? (
          <div className="pass-layout">
            <QrDisplay userId={userId} profile={profile} />
            <ProfileForm onProfileSaved={handleProfileSaved} />
          </div>
        ) : (
          <QrScanner />
        )}
      </main>

      <nav className="mobile-nav" aria-label="Attendee views">
        <button
          type="button"
          aria-pressed={activeTab === "badge"}
          onClick={() => setActiveTab("badge")}
          className="mobile-nav-button"
        >
          <BadgeCheck aria-hidden="true" />
          My pass
        </button>
        <button
          type="button"
          aria-pressed={activeTab === "scan"}
          onClick={() => setActiveTab("scan")}
          className="mobile-nav-button"
        >
          <ScanLine aria-hidden="true" />
          Scan badge
        </button>
      </nav>
    </div>
  );
}