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
    <section className="scanner-panel">
      <div className="section-heading">
        <span className="section-icon"><ScanLine aria-hidden="true" /></span>
        <div>
          <h2 className="section-title">Scan an attendee pass</h2>
          <p className="section-description">Use your camera to open someone’s attendee profile.</p>
        </div>
      </div>

      <p className="scanner-description">Allow camera access, then hold the badge inside the frame.</p>
      <div className="scanner-window">
        <div id="qr-reader" />
      </div>

      {loading && <p role="status" className="loading-indicator"><LoaderCircle aria-hidden="true" /> Fetching profile...</p>}
      {error && <p role="alert" className="status-message status-error">{error}</p>}

      {scannedUser && (
        <div className="scanned-profile">
          <span className="section-icon"><UserRound aria-hidden="true" /></span>
          <div className="min-w-0">
            <h3 className="scanned-name">{scannedUser.full_name}</h3>
            {scannedUser.headline && <p className="scanned-detail">{scannedUser.headline}</p>}
            {scannedUser.phone && <p className="scanned-detail">{scannedUser.phone}</p>}
          </div>
        </div>
      )}
    </section>
  );
}