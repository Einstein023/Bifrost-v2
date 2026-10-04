import React, { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, Check, ChevronRight, Flashlight, LoaderCircle, ScanLine, Wifi } from "lucide-react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";

export default function QrScanner({ onBack, onContactScanned, storageError }) {
  const [scannedUser, setScannedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [badgeId, setBadgeId] = useState("");
  const [scannerVersion, setScannerVersion] = useState(0);
  const scannerRef = useRef(null);

  const resolveBadge = useCallback(async (rawValue, fromCamera = false) => {
    const targetUid = rawValue.trim().replace(/^bifrost:\/\/connect\//i, "");
    if (!targetUid) {
      setError("Enter a badge ID or scan an attendee QR code.");
      return;
    }

    if (fromCamera && scannerRef.current) {
      try {
        await scannerRef.current.clear();
      } catch (clearError) {
        console.error("Scanner pause error:", clearError);
      }
    }

    setLoading(true);
    setError("");

    try {
      const profileSnapshot = await getDoc(doc(db, "profiles", targetUid));
      if (!profileSnapshot.exists()) {
        setScannedUser(null);
        setError("Attendee profile not found. Check the badge and try again.");
        return;
      }

      const profileData = profileSnapshot.data();
      const attendee = { uid: targetUid, ...profileData };
      setScannedUser(attendee);
      setBadgeId("");
      onContactScanned?.(targetUid, profileData);
    } catch (scanError) {
      console.error("Scan processing error:", scanError);
      setError("We couldn't load this attendee. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [onContactScanned]);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: { width: 220, height: 220 },
        aspectRatio: 1,
      },
      false,
    );
    scannerRef.current = scanner;
    scanner.render(
      (decodedText) => resolveBadge(decodedText, true),
      () => {},
    );

    return () => {
      scannerRef.current = null;
      scanner.clear().catch((cleanupError) => {
        console.error("Scanner cleanup error:", cleanupError);
      });
    };
  }, [resolveBadge, scannerVersion]);

  const handleManualLookup = (event) => {
    event.preventDefault();
    resolveBadge(badgeId);
  };

  const scanAgain = () => {
    setScannedUser(null);
    setError("");
    setScannerVersion((version) => version + 1);
  };

  return (
    <section className="scanner-shell" aria-labelledby="scanner-title">
      <div className="scanner-topbar">
        <button type="button" className="scanner-back" aria-label="Back to pass" onClick={onBack}>
          <ArrowLeft aria-hidden="true" />
        </button>
        <h1 id="scanner-title">Scan Badge</h1>
        <span className="scanner-tools" aria-hidden="true"><Flashlight /></span>
      </div>

      <div className="scanner-layout">
        <div className="scanner-camera-column">
          <p className="scanner-guide">Align a Bifrost QR code inside the frame</p>
          <div className="scanner-window">
            <div className="scanner-frame-corners" aria-hidden="true" />
            <div id="qr-reader" />
          </div>
          <p className="scanner-instruction">Allow camera access, then hold the badge steady.</p>
          <span className="scanner-active"><ScanLine aria-hidden="true" /> Ready to scan</span>

          {loading && (
            <p role="status" className="loading-indicator">
              <LoaderCircle aria-hidden="true" /> Looking up attendee...
            </p>
          )}
          {error && <p role="alert" className="scan-error">{error}</p>}
          {storageError && <p role="alert" className="scan-error">{storageError}</p>}

          {scannedUser && (
            <div role="status" className="scanner-result">
              <strong>{scannedUser.full_name}</strong>
              <p>{scannedUser.headline || "Added to your Contacts Deck"}</p>
              <button type="button" className="scan-again" onClick={scanAgain}>Scan another badge</button>
            </div>
          )}
        </div>

        <div className="scanner-tools-panel">
          <div className="scanner-tool-row">
            <span className="scanner-tool-row-icon"><Wifi aria-hidden="true" /></span>
            <span className="scanner-tool-copy">
              <strong>QR badge scan</strong>
              <small>Camera access is needed to connect</small>
            </span>
            <ChevronRight aria-hidden="true" />
          </div>
          <div className="scanner-tool-row">
            <span className="scanner-tool-row-icon"><Check aria-hidden="true" /></span>
            <span className="scanner-tool-copy">
              <strong>Contacts Deck</strong>
              <small>Scanned badges are saved on this device</small>
            </span>
            <ChevronRight aria-hidden="true" />
          </div>
          <form className="manual-id-form" onSubmit={handleManualLookup}>
            <input
              aria-label="Badge ID"
              autoComplete="off"
              value={badgeId}
              onChange={(event) => setBadgeId(event.target.value)}
              placeholder="Enter badge ID manually"
            />
            <button type="submit" disabled={loading}>Look up</button>
          </form>
        </div>
      </div>
    </section>
  );
}
