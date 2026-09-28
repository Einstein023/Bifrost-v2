import React, { useCallback, useState } from "react";
import ProfileForm from "./components/ProfileForm";
import QrDisplay from "./components/QrDisplay";

export default function App() {
  const [userId, setUserId] = useState(null);
  const [profile, setProfile] = useState(null);

  const handleProfileSaved = useCallback((uid, profileData) => {
    setUserId(uid);
    setProfile(profileData);
  }, []);

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 500, margin: "0 auto" }}>
      <header style={{ padding: 20, borderBottom: "1px solid #eee" }}>
        <h1>Bifrost Attendee</h1>
      </header>

      <main>
        <ProfileForm onProfileSaved={handleProfileSaved} />
        <QrDisplay userId={userId} profile={profile} />
      </main>
    </div>
  );
}