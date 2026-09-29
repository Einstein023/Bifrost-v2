import React, { useEffect, useState } from "react";
import { LoaderCircle, ScanLine, UserRound } from "lucide-react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";

export default function QrScanner({ onContactScanned }) {
  const [scannedUser, setScannedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // 1. Initialize scanner widget
    const scanner = new Html5QrcodeScanner("qr-reader", {
      fps: 10,
      qrbox: { width: 250, height: 250 },
    });

    const handleSuccess = async (decodedText) => {
      // Expecting payload format: "bifrost://connect/{userId}" or plain userId
      const targetUid = decodedText.includes("bifrost://connect/")
        ? decodedText.replace("bifrost://connect/", "")
        : decodedText;

      if (!targetUid) return;

      scanner.clear(); // Pause scanner once hit
      setLoading(true);
      setError("");

      try {
        // Fetch target attendee's public profile from Firestore
        const docRef = doc(db, "profiles", targetUid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const profileData = docSnap.data();
          setScannedUser({ uid: targetUid, ...profileData });
          if (onContactScanned) onContactScanned(targetUid, profileData);
        } else {
          setError("Attendee profile not found.");
        }
      } catch (err) {
        console.error("Scan processing error:", err);
        setError("Failed to fetch scanned user profile.");
      } finally {
        setLoading(false);
      }
    };

    scanner.render(handleSuccess, (_err) => {
      // Ignored non-critical frame scan errors
    });

    return () => {
      scanner.clear().catch(() => {});
    };
  }, [onContactScanned]);

  return (
    <section className="mx-auto max-w-2xl rounded-2xl border border-[#e1e8e2] bg-white p-5 shadow-[0_12px_36px_-28px_rgba(35,67,57,0.32)] sm:p-7">
      <div className="mb-5 flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#edf4ef] text-[#386d60]"><ScanLine size={19} /></span>
        <div>
          <h2 className="font-[Manrope] text-lg font-bold text-[#243b36]">Scan an attendee pass</h2>
          <p className="mt-1 text-sm leading-5 text-[#74807b]">Use your camera to open someone’s attendee profile.</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#e3eae4] bg-[#f7f9f6]">
        <div id="qr-reader" />
      </div>

      {loading && <p role="status" className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-[#56766b]"><LoaderCircle size={17} className="animate-spin" /> Fetching profile...</p>}
      {error && <p role="alert" className="mt-4 rounded-xl border border-[#efd8d1] bg-[#fff7f4] px-3.5 py-3 text-sm text-[#9a4d3c]">{error}</p>}

      {scannedUser && (
        <div className="mt-5 flex animate-rise-in items-start gap-3 rounded-xl border border-[#d6e6d8] bg-[#f3f8f2] p-4 text-left">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-[#56806c]"><UserRound size={19} /></span>
          <div className="min-w-0">
            <h3 className="font-[Manrope] font-bold text-[#2c453b]">{scannedUser.full_name}</h3>
            {scannedUser.headline && <p className="mt-0.5 text-sm text-[#6b7d73]">{scannedUser.headline}</p>}
            {scannedUser.phone && <p className="mt-2 text-sm text-[#52685d]">{scannedUser.phone}</p>}
          </div>
        </div>
      )}
    </section>
  );
}