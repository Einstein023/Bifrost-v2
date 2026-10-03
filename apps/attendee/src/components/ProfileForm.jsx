import React, { useState, useEffect } from "react";
import { Check, LoaderCircle, Save, UserRound } from "lucide-react";
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
  }, [onProfileSaved]);

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

  if (loading) return (
    <section role="status" className="loading-panel">
      <LoaderCircle className="loading-indicator" aria-hidden="true" />
      <p>Preparing your attendee pass...</p>
    </section>
  );

  return (
    <form onSubmit={handleSubmit} className="profile-panel">
      <div className="section-heading">
        <span className="section-icon"><UserRound aria-hidden="true" /></span>
        <div>
          <h2 className="section-title">Your profile</h2>
          <p className="section-description">A few details make it easier to connect.</p>
        </div>
      </div>

      {error && <p role="alert" className="status-message status-error">{error}</p>}
      {saved && <p role="status" className="status-message status-success"><Check aria-hidden="true" /> Profile saved successfully.</p>}

      <div className="profile-fields">
        <label className="profile-field">
          <span>Full name <span className="required-mark">*</span></span>
          <input
            type="text"
            autoComplete="name"
            placeholder="e.g. Alex Morgan"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </label>
        <label className="profile-field">
          <span>Headline <span className="optional-label">(optional)</span></span>
          <input
            type="text"
            placeholder="What do you do?"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
          />
        </label>
        <label className="profile-field">
          <span>Phone <span className="optional-label">(optional)</span></span>
          <input
            type="tel"
            autoComplete="tel"
            placeholder="Your phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </label>
      </div>

      <button type="submit" disabled={!user || saving} className="primary-button">
        {saving ? <LoaderCircle className="loading-indicator" aria-hidden="true" /> : <Save aria-hidden="true" />}
        {saving ? "Saving your profile..." : "Save profile"}
      </button>
    </form>
  );
}