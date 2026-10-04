import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  BadgeCheck,
  Bell,
  ContactRound,
  Download,
  Home,
  MessageCircle,
  Phone,
  QrCode,
  ScanLine,
  Search,
  Share2,
  Sparkles,
  UserRound,
} from "lucide-react";
import ProfileForm from "./components/ProfileForm";
import QrDisplay from "./components/QrDisplay";
import QrScanner from "./components/QrScanner";

const contactStorageKey = (uid) => `bifrost:contacts:${uid}`;

function readContacts(uid) {
  try {
    const savedContacts = window.localStorage.getItem(contactStorageKey(uid || "guest"));
    const parsedContacts = savedContacts ? JSON.parse(savedContacts) : [];
    return Array.isArray(parsedContacts) ? parsedContacts : [];
  } catch (error) {
    console.error("Contact deck load error:", error);
    return [];
  }
}

function vCardValue(value = "") {
  return String(value).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

function exportVCard(person, uid) {
  const name = person?.full_name?.trim();
  if (!name) return false;

  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${vCardValue(name)}`,
    `N:${vCardValue(name)}`,
  ];
  if (person.headline) lines.push(`NOTE:${vCardValue(person.headline)}`);
  if (person.phone) lines.push(`TEL;TYPE=CELL:${vCardValue(person.phone)}`);
  if (uid) lines.push(`UID:${vCardValue(uid)}`);
  lines.push("END:VCARD");

  const file = new Blob([lines.join("\r\n")], { type: "text/vcard;charset=utf-8" });
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${name.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "bifrost-contact"}.vcf`;
  link.click();
  URL.revokeObjectURL(url);
  return true;
}

function initialsFor(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "B";
}

function ContactCard({ contact }) {
  const initials = initialsFor(contact.full_name);
  const avatarColors = ["blue", "green", "yellow", "lavender"];
  const colorIndex = contact.full_name.length % avatarColors.length;

  return (
    <article className="contact-card">
      <div className="contact-card-top">
        <span className={`contact-avatar contact-avatar-${avatarColors[colorIndex]}`} aria-hidden="true">
          {initials}
        </span>
        <div className="contact-copy">
          <h2 className="contact-name">{contact.full_name}</h2>
          <p className="contact-headline">{contact.headline || "Bifrost attendee"}</p>
          <p className="contact-meta">
            Added {new Date(contact.addedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
          </p>
        </div>
        <BadgeCheck className="contact-verified" aria-label="Scanned attendee" />
      </div>
      <div className="contact-actions">
        {contact.phone ? (
          <>
            <a className="contact-action contact-action-message" href={`sms:${encodeURIComponent(contact.phone)}`}>
              <MessageCircle aria-hidden="true" /> Message
            </a>
            <a className="contact-action" href={`tel:${encodeURIComponent(contact.phone)}`}>
              <Phone aria-hidden="true" /> Call
            </a>
          </>
        ) : (
          <span className="contact-no-phone">No phone number shared</span>
        )}
        <button
          className="contact-action contact-action-export"
          type="button"
          onClick={() => exportVCard(contact, contact.uid)}
        >
          <Download aria-hidden="true" /> Export
        </button>
      </div>
    </article>
  );
}

function ContactsDeck({ contacts, onScan, storageError }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const filteredContacts = useMemo(() => {
    const searchTerm = query.trim().toLowerCase();
    return contacts.filter((contact) => {
      const matchesQuery = !searchTerm || [contact.full_name, contact.headline, contact.phone]
        .some((value) => value?.toLowerCase().includes(searchTerm));
      const matchesFilter = filter !== "phone" || Boolean(contact.phone);
      return matchesQuery && matchesFilter;
    });
  }, [contacts, filter, query]);

  const exportAll = () => {
    const cards = contacts
      .map((contact) => {
        const fields = [
          "BEGIN:VCARD",
          "VERSION:3.0",
          `FN:${vCardValue(contact.full_name)}`,
          `N:${vCardValue(contact.full_name)}`,
        ];
        if (contact.headline) fields.push(`NOTE:${vCardValue(contact.headline)}`);
        if (contact.phone) fields.push(`TEL;TYPE=CELL:${vCardValue(contact.phone)}`);
        if (contact.uid) fields.push(`UID:${vCardValue(contact.uid)}`);
        fields.push("END:VCARD");
        return fields.join("\r\n");
      })
      .join("\r\n");
    const file = new Blob([cards], { type: "text/vcard;charset=utf-8" });
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = "bifrost-contacts.vcf";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="deck-screen" aria-labelledby="deck-title">
      <div className="deck-heading">
        <div>
          <p className="deck-kicker">YOUR NETWORK</p>
          <h1 id="deck-title">Contacts Deck</h1>
        </div>
        <span className="contact-count">{contacts.length} saved</span>
      </div>

      <label className="contact-search">
        <Search aria-hidden="true" />
        <span className="sr-only">Search contacts</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name or role"
        />
      </label>

      <div className="deck-toolbar">
        <div className="contact-filters" aria-label="Filter contacts">
          <button type="button" aria-pressed={filter === "all"} onClick={() => setFilter("all")}>All</button>
          <button type="button" aria-pressed={filter === "phone"} onClick={() => setFilter("phone")}>Has phone</button>
        </div>
        <button className="filter-button" type="button" onClick={() => setFilter(filter === "phone" ? "all" : "phone")}>
          <Search aria-hidden="true" /> Filter
        </button>
      </div>

      <button className="export-all-button" type="button" onClick={exportAll} disabled={!contacts.length}>
        <Share2 aria-hidden="true" /> Export all contacts ({contacts.length})
      </button>

      {storageError && <p role="alert" className="deck-error">{storageError}</p>}

      {filteredContacts.length ? (
        <div className="contact-list">
          {filteredContacts.map((contact) => <ContactCard key={contact.uid} contact={contact} />)}
        </div>
      ) : (
        <div className="deck-empty">
          <span className="empty-icon"><ContactRound aria-hidden="true" /></span>
          <h2>{contacts.length ? "No matches found" : "Your deck is ready"}</h2>
          <p>{contacts.length ? "Try another name or filter." : "Scan an attendee badge to add your first contact."}</p>
          {!contacts.length && (
            <button type="button" className="empty-scan-button" onClick={onScan}>
              <ScanLine aria-hidden="true" /> Scan a badge
            </button>
          )}
        </div>
      )}
    </section>
  );
}

export default function App() {
  const [userId, setUserId] = useState(null);
  const [profile, setProfile] = useState(null);
  const [contacts, setContacts] = useState(() => readContacts(null));
  const [activeTab, setActiveTab] = useState("home");
  const [storageError, setStorageError] = useState("");
  const [shareMessage, setShareMessage] = useState("");
  const [profileEditorOpen, setProfileEditorOpen] = useState(true);
  const contactsRef = useRef(contacts);

  const replaceContacts = useCallback((nextContacts) => {
    contactsRef.current = nextContacts;
    setContacts(nextContacts);
  }, []);

  const handleProfileSaved = useCallback((uid, profileData) => {
    setUserId(uid);
    setProfile(profileData);
    setProfileEditorOpen(false);
    const savedContacts = readContacts(uid);
    const mergedContacts = [
      ...savedContacts,
      ...contactsRef.current.filter((contact) => !savedContacts.some((saved) => saved.uid === contact.uid)),
    ];
    try {
      window.localStorage.setItem(contactStorageKey(uid), JSON.stringify(mergedContacts));
      window.localStorage.removeItem(contactStorageKey("guest"));
    } catch (error) {
      console.error("Contact deck migration error:", error);
      setStorageError("Contacts were loaded, but could not be saved to your attendee profile.");
    }
    replaceContacts(mergedContacts);
  }, [replaceContacts]);

  const handleContactScanned = useCallback((uid, profileData) => {
    const nextContacts = [
      { ...profileData, uid, addedAt: new Date().toISOString() },
      ...contactsRef.current.filter((contact) => contact.uid !== uid),
    ];
    try {
      window.localStorage.setItem(contactStorageKey(userId || "guest"), JSON.stringify(nextContacts));
      setStorageError("");
    } catch (error) {
      console.error("Contact deck save error:", error);
      setStorageError("This contact was scanned, but could not be saved on this device.");
    }
    replaceContacts(nextContacts);
  }, [replaceContacts, userId]);

  const handleExportProfile = () => {
    if (!exportVCard(profile, userId)) {
      setStorageError("Save your name in Edit profile before exporting your pass.");
    } else {
      setStorageError("");
    }
  };

  const handleSharePass = async () => {
    if (!userId) return;

    const payload = `bifrost://connect/${userId}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: "My Bifrost pass",
          text: `Connect with ${profile?.full_name || "me"} on Bifrost: ${payload}`,
        });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(payload);
        setShareMessage("Pass link copied.");
      } else {
        throw new Error("Sharing and clipboard access are not available.");
      }
      setStorageError("");
    } catch (error) {
      if (error.name === "AbortError") return;
      console.error("Pass share error:", error);
      setStorageError("We couldn't share your pass. Try exporting your vCard instead.");
    }
  };

  const initials = initialsFor(profile?.full_name);
  const isScanner = activeTab === "scan";

  return (
    <div className={`attendee-app${isScanner ? " attendee-app-scanner" : ""}`}>
      <header className={`app-header${isScanner ? " app-header-scanner" : ""}`}>
        <a href="#main" className="brand" aria-label="Bifrost attendee home" onClick={() => setActiveTab("home")}>
          <span className="brand-mark"><Sparkles aria-hidden="true" /></span>
          <span>Bifrost<span className="brand-period">.</span></span>
        </a>
        <nav className="desktop-nav" aria-label="Attendee pages">
          <button type="button" aria-pressed={activeTab === "home"} onClick={() => setActiveTab("home")}>
            <Home aria-hidden="true" /> Pass
          </button>
          <button type="button" aria-pressed={activeTab === "deck"} onClick={() => setActiveTab("deck")}>
            <ContactRound aria-hidden="true" /> Contacts Deck
          </button>
          <button type="button" aria-pressed={isScanner} onClick={() => setActiveTab("scan")}>
            <QrCode aria-hidden="true" /> Scan Badge
          </button>
        </nav>
        <button type="button" className="header-alert" aria-label="Notifications">
          <Bell aria-hidden="true" />
        </button>
        <button type="button" className="header-avatar" aria-label="Edit your profile" onClick={() => {
          setActiveTab("home");
          setProfileEditorOpen(true);
          window.setTimeout(() => {
            document.querySelector(".profile-details")?.scrollIntoView({ behavior: "smooth" });
          }, 0);
        }}>
          {initials}
        </button>
      </header>

      <main id="main" className="app-main">
        {activeTab === "home" && (
          <div className="home-screen">
            <div className="home-heading">
              <p className="greeting">GOOD MORNING</p>
              <h1>{profile?.full_name || "Your Bifrost pass"}</h1>
            </div>
            <QrDisplay userId={userId} profile={profile} onShare={handleSharePass} />
            <div className="home-actions">
              <button type="button" className="home-action home-action-blue" onClick={() => setActiveTab("home")}>
                <span className="home-action-icon"><BadgeCheck aria-hidden="true" /></span>
                <span><strong>My Pass</strong><small>Ready to share</small></span>
              </button>
              <button type="button" className="home-action home-action-green" onClick={() => setActiveTab("scan")}>
                <span className="home-action-icon"><ScanLine aria-hidden="true" /></span>
                <span><strong>Scan Badge</strong><small>Connect with people</small></span>
              </button>
              <button type="button" className="home-action home-action-yellow" onClick={() => setActiveTab("deck")}>
                <span className="home-action-icon"><ContactRound aria-hidden="true" /></span>
                <span><strong>Contacts Deck</strong><small>{contacts.length} saved</small></span>
              </button>
              <button type="button" className="home-action home-action-white" onClick={handleExportProfile}>
                <span className="home-action-icon"><Download aria-hidden="true" /></span>
                <span><strong>Export vCard</strong><small>Save your pass</small></span>
              </button>
            </div>
            {storageError && <p role="alert" className="home-error">{storageError}</p>}
            {shareMessage && <p role="status" className="home-status">{shareMessage}</p>}
            <details
              className="profile-details"
              open={profileEditorOpen}
              onToggle={(event) => setProfileEditorOpen(event.currentTarget.open)}
            >
              <summary><UserRound aria-hidden="true" /> Edit profile</summary>
              <ProfileForm onProfileSaved={handleProfileSaved} />
            </details>
          </div>
        )}

        {activeTab === "deck" && (
          <ContactsDeck
            contacts={contacts}
            onScan={() => setActiveTab("scan")}
            storageError={storageError}
          />
        )}

        {isScanner && (
          <QrScanner
            onBack={() => setActiveTab("home")}
            onContactScanned={handleContactScanned}
            storageError={storageError}
          />
        )}
      </main>

      <nav className="mobile-nav" aria-label="Attendee pages">
        <button type="button" aria-pressed={activeTab === "home"} onClick={() => setActiveTab("home")}>
          <Home aria-hidden="true" /><span>Pass</span>
        </button>
        <button type="button" aria-pressed={activeTab === "deck"} onClick={() => setActiveTab("deck")}>
          <ContactRound aria-hidden="true" /><span>Deck</span>
        </button>
        <button type="button" aria-pressed={isScanner} onClick={() => setActiveTab("scan")}>
          <QrCode aria-hidden="true" /><span>Scan</span>
        </button>
      </nav>
    </div>
  );
}
