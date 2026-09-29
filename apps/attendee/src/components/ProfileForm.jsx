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
    <section role="status" className="grid min-h-72 place-items-center rounded-2xl border border-[#e1e8e2] bg-white p-8 text-center shadow-[0_12px_36px_-28px_rgba(35,67,57,0.32)]">
      <div>
        <LoaderCircle className="mx-auto mb-3 animate-spin text-[#4e8174]" size={24} />
        <p className="text-sm font-medium text-[#63716c]">Preparing your attendee pass...</p>
      </div>
    </section>
  );

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-[#e1e8e2] bg-white p-5 shadow-[0_12px_36px_-28px_rgba(35,67,57,0.32)] transition-shadow duration-300 hover:shadow-[0_18px_42px_-28px_rgba(35,67,57,0.4)] sm:p-6">
      <div className="mb-6 flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#edf4ef] text-[#386d60]"><UserRound size={19} /></span>
        <div>
          <h2 className="font-[Manrope] text-lg font-bold text-[#243b36]">Your profile</h2>
          <p className="mt-1 text-sm leading-5 text-[#74807b]">A few details make it easier to connect.</p>
        </div>
      </div>

      {error && <p role="alert" className="mb-4 rounded-xl border border-[#efd8d1] bg-[#fff7f4] px-3.5 py-3 text-sm leading-5 text-[#9a4d3c]">{error}</p>}
      {saved && <p role="status" className="mb-4 flex items-center gap-2 rounded-xl border border-[#d2e6d8] bg-[#f2f8f3] px-3.5 py-3 text-sm font-medium text-[#356847]"><Check size={16} /> Profile saved successfully.</p>}

      <div className="grid gap-4">
        <label className="grid gap-1.5 text-sm font-semibold text-[#40534d]">
          <span>Full name <span className="text-[#a75c47]">*</span></span>
          <input
            type="text"
            autoComplete="name"
            placeholder="e.g. Alex Morgan"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="min-h-12 w-full rounded-xl border border-[#dce5df] bg-[#fcfdfb] px-3.5 text-[15px] font-normal text-[#263b35] outline-none transition duration-150 placeholder:text-[#a2ada7] hover:border-[#b7c9c0] focus:border-[#5a8f80] focus:ring-4 focus:ring-[#5a8f80]/12"
          />
        </label>
        <label className="grid gap-1.5 text-sm font-semibold text-[#40534d]">
          <span>Headline <span className="font-normal text-[#8a9690]">(optional)</span></span>
          <input
            type="text"
            placeholder="What do you do?"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            className="min-h-12 w-full rounded-xl border border-[#dce5df] bg-[#fcfdfb] px-3.5 text-[15px] font-normal text-[#263b35] outline-none transition duration-150 placeholder:text-[#a2ada7] hover:border-[#b7c9c0] focus:border-[#5a8f80] focus:ring-4 focus:ring-[#5a8f80]/12"
          />
        </label>
        <label className="grid gap-1.5 text-sm font-semibold text-[#40534d]">
          <span>Phone <span className="font-normal text-[#8a9690]">(optional)</span></span>
          <input
            type="tel"
            autoComplete="tel"
            placeholder="Your phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="min-h-12 w-full rounded-xl border border-[#dce5df] bg-[#fcfdfb] px-3.5 text-[15px] font-normal text-[#263b35] outline-none transition duration-150 placeholder:text-[#a2ada7] hover:border-[#b7c9c0] focus:border-[#5a8f80] focus:ring-4 focus:ring-[#5a8f80]/12"
          />
        </label>
      </div>

      <button type="submit" disabled={!user || saving} className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#285b50] px-4 text-sm font-bold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-[#214e44] hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#39766a] disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-[#9aaea6] disabled:shadow-none">
        {saving ? <LoaderCircle size={17} className="animate-spin" /> : <Save size={17} />}
        {saving ? "Saving your profile..." : "Save profile"}
      </button>
    </form>
  );
}