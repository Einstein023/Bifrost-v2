import React, { useState, useEffect } from "react";
import { auth, db } from "../../firebase.js";
import { signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function ProfileForm({ onProfileSaved }) {
  const [user, setUser] = useState(null);
  const [fullName, setFullName] = useState("");
  const [headline, setHeadline] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (!active) return;
        setError("");

        // If no user is logged in, sign in anonymously
        if (!currentUser) {
          await signInAnonymously(auth);
          return; // onAuthStateChanged will fire again automatically with the user
        }

        setUser(currentUser);

        // Fetch existing profile from Firestore
        const docRef = doc(db, "profiles", currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (active && docSnap.exists()) {
          const data = docSnap.data();
          setFullName(data.full_name || "");
          setHeadline(data.headline || "");
          setPhone(data.phone || "");

          if (onProfileSaved) {
            onProfileSaved(currentUser.uid, data);
          }
        }
      } catch (err) {
        if (active) {
          console.error("Profile load error:", err);
          setError("We couldn't load your profile. You can still try saving it.");
        }
      } finally {
        if (active) setLoading(false);
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []); // Empty dependency array prevents re-render loops

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || saving) return;

    const profileData = {
      full_name: fullName,
      headline: headline,
      phone: phone,
      updated_at: new Date().toISOString(),
    };

    setSaving(true);
    setError("");
    setSaved(false);

    try {
      await setDoc(doc(db, "profiles", user.uid), profileData, { merge: true });
      if (onProfileSaved) {
        onProfileSaved(user.uid, profileData);
      }
      setSaved(true);
    } catch (err) {
      console.error("Profile save error:", err);
      setError("We couldn't save your profile. Please check your connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div role="status" style={{ padding: 20 }}>Loading your pass...</div>;

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12, padding: 20, maxWidth: 400 }}>
      <h2>My Event Pass</h2>

      {error && <p role="alert" style={{ color: "red" }}>{error}</p>}
      {saved && <p role="status" style={{ color: "green" }}>Profile saved successfully.</p>}

      <input 
        type="text" 
        placeholder="Full Name *" 
        value={fullName} 
        onChange={(e) => setFullName(e.target.value)} 
        required 
      />
      <input 
        type="text" 
        placeholder="Headline (e.g. Frontend Developer)" 
        value={headline} 
        onChange={(e) => setHeadline(e.target.value)} 
      />
      <input 
        type="tel" 
        placeholder="Phone Number" 
        value={phone} 
        onChange={(e) => setPhone(e.target.value)} 
      />

      <button type="submit" disabled={!user || saving} style={{ padding: 10, cursor: !user || saving ? "not-allowed" : "pointer" }}>
        {saving ? "Saving..." : "Save Profile"}
      </button>
    </form>
  );
}