import { useEffect, useState } from "react";
import { db } from "../firebase";

export default function App() {
  const [status, setStatus] = useState("Checking Firebase connection...");

  useEffect(() => {
    if (db) {
      setStatus("Connected to Firebase successfully!");
    } else {
      setStatus("Firebase configuration error.");
    }
  }, []);

  return (
    <div style={{ padding: 40, fontFamily: "sans-serif" }}>
      <h1>Bifrost Phase 1 Check</h1>
      <p style={{ fontWeight: "bold", color: db ? "green" : "red" }}>{status}</p>
    </div>
  );
}