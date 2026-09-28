import React, { useState, useEffect } from "react";
import { auth, db } from "../../firebase.js";
import { signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function ProfileForm({ onProfileSaved }) {
  const [user, setUser] = useState(null);
  const [fullName, setFullName] = useState("");
  const [headline, setHeadline] = useState("");
  const [phone, setPhone] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [loading, setLoading] = useState(true);

  // 1. Authenticate user anonymously on load for fast event onboarding
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        const anon = await signInAnonymously(auth);
        setUser(anon.user);
      } else {
        setUser(currentUser);
        // Load existing profile from Firestore if present
        const docRef = doc(db, "profiles", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFullName(data.full_name || "");
          setHeadline(data.headline || "");
          setPhone(data.phone || "");
          setLinkedin(data.linkedin_url || "");
          onProfileSaved(currentUser.uid, data);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [onProfileSaved]);

  // 2. Save or update profile in Firestore
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    const profileData = {
      full_name: fullName,
      headline: headline,
      phone: phone,
      linkedin_url: linkedin,
      updated_at: new Date().toISOString(),
    };

    await setDoc(doc(db, "profiles", user.uid), profileData, { merge: true });
    onProfileSaved(user.uid, profileData);
    alert("Profile saved successfully!");
  };

  if (loading) return <div style={{ padding: 20 }}>Loading your pass...</div>;

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12, padding: 20, maxWidth: 400 }}>
      <h2>My Event Pass</h2>
      
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
      <input 
        type="url" 
        placeholder="LinkedIn URL" 
        value={linkedin} 
        onChange={(e) => setLinkedin(e.target.value)} 
      />

      <button type="submit" style={{ padding: 10, cursor: "pointer" }}>
        Save Profile
      </button>
    </form>
  );
}