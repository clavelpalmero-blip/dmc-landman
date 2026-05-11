import { useState, useMemo, useCallback, useEffect } from "react";
import { supabase } from "./supabase";

// ── PARSER ────────────────────────────────────────────────────────────────────
function parseComments(raw) {
  if (!raw) return { log: [], ups: [], cur: [] };
  const entries = raw.split("||").map((s) => s.trim()).filter(Boolean);
  const log = [], ups = [], cur = [];
  const seen = new Set();
  const upsRx = /\b(1Z[A-Z0-9]{14,})\b/gi;
  const dateRx = /^(\d{1,2}\/\d{1,2}\/\d{4})\s*:/;
  const curKw = /\b(deceased|death|heir|heirship|adh|lwt|probate|curative|retraction|re-execution|vesting deed|affidavit|unleasable|not leasable)\b/i;

  entries.forEach((entry) => {
    const dm = entry.match(dateRx);
    const date = dm ? dm[1] : "";
    const text = dm ? entry.slice(dm[0].length).trim() : entry;
    const tracks = [...text.matchAll(upsRx)].map((m) => m[1]);

    tracks.forEach((t) => {
      if (seen.has(t)) return;
      seen.add(t);
      let status = "Sent";
      if (/delivered/i.test(text)) status = "Delivered";
      else if (/rts|return(ed)? to sender|unable to obtain/i.test(text)) status = "RTS";
      ups.push({ tracking: t, date, notes: text.replace(upsRx, "").trim().slice(0, 100), status });
    });

    if (curKw.test(text)) {
      const priority = /deceased|heir|probate|adh|lwt|unleasable/i.test(text) ? "high" : "medium";
      cur.push({ date, issue: text.slice(0, 220), priority });
    }

    let tag = "note";
    if (/mailed|ups|tracking|delivered|rts|returned/i.test(text) && tracks.length) tag = "ups";
    else if (curKw.test(text)) tag = "curative";
    else if (/adverse|adversing|open to lease|expired/i.test(text)) tag = "adverse";
    else if (/phone|called|spoke|email|contact|voicemail|text|talked/i.test(text)) tag = "contact";
    else if (/negotiat|counter|bonus|royalt/i.test(text)) tag = "negotiation";
    else if (/approved|executed|received|signed/i.test(text)) tag = "executed";
    log.push({ date, text, tag });
  });

  return { log, ups, cur };
}

// ── STATUS / COLOR CONFIG ─────────────────────────────────────────────────────
const STATUS_MAP = {
  "Executed Document Received": "green",
  "Offer Mailed": "blue",
  "RTS": "amber",
  "Deceased": "red",
  "Leased to 3rd party": "gray",
  "Re-execution Needed": "purple",
  "Transferred": "gray",
  "Drop/HBP": "gray",
  "Committed to Lease": "green",
  "New Upload": "gray",
};

const TAG_COLORS = {
  ups: { bg: "#E6F1FB", co: "#0C447C" },
  curative: { bg: "#FCEBEB", co: "#791F1F" },
  contact: { bg: "#EAF3DE", co: "#27500A" },
  adverse: { bg: "#F1EFE8", co: "#444441" },
  email: { bg: "#EEEDFE", co: "#3C3489" },
  executed: { bg: "#EAF3DE", co: "#27500A" },
  negotiation: { bg: "#FAEEDA", co: "#633806" },
  note: { bg: "#F1EFE8", co: "#5F5E5A" },
};

const BADGE_STYLES = {
  green: { bg: "#EAF3DE", co: "#27500A" },
  blue: { bg: "#E6F1FB", co: "#0C447C" },
  amber: { bg: "#FAEEDA", co: "#633806" },
  red: { bg: "#FCEBEB", co: "#791F1F" },
  gray: { bg: "#F1EFE8", co: "#444441" },
  purple: { bg: "#EEEDFE", co: "#3C3489" },
};

const ALL_STATUSES = [
  "Offer Mailed", "Executed Document Received", "RTS", "Deceased",
  "Leased to 3rd party", "Re-execution Needed", "Transferred",
  "Drop/HBP", "Committed to Lease", "New Upload",
];

const sc = (s) => STATUS_MAP[s] || "gray";

// ── REUSABLE UI ───────────────────────────────────────────────────────────────
function Badge({ color, children, sm }) {
  const s = BADGE_STYLES[color] || BADGE_STYLES.gray;
  return (
    <span style={{ background: s.bg, color: s.co, display: "inline-block", padding: sm ? "1px 5px" : "2px 7px", borderRadius: 10, fontSize: sm ? 9 : 10, fontWeight: 500, whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
}

function TagPill({ tag }) {
  const s = TAG_COLORS[tag] || TAG_COLORS.note;
  return (
    <span style={{ background: s.bg, color: s.co, padding: "1px 5px", borderRadius: 8, fontSize: 9, fontWeight: 500, marginRight: 5, verticalAlign: 1, display: "inline-block" }}>
      {tag}
    </span>
  );
}

function FieldRow({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "4px 0", borderBottom: "0.5px solid var(--color-border-tertiary, #e5e7eb)", fontSize: 11 }}>
      <span style={{ color: "#6b7280", flex: "0 0 135px" }}>{label}</span>
      <span style={{ textAlign: "right", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value || "—"}</span>
    </div>
  );
}

function StatCard({ label, value, sub, valueColor }) {
  return (
    <div style={{ background: "#f9fafb", borderRadius: 8, padding: "10px 12px" }}>
      <div style={{ fontSize: 10, color: "#6b7280", marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 500, color: valueColor || "#111827" }}>{value}</div>
      {sub && <div style={{ fontSize: 10, color: "#6b7280", marginTop: 1 }}>{sub}</div>}
    </div>
  );
}

function Card({ children, style }) {
  return (
    <div style={{ background: "#fff", border: "0.5px solid #e5e7eb", borderRadius: 12, padding: "12px 14px", marginBottom: 10, ...style }}>
      {children}
    </div>
  );
}

function Btn({ onClick, primary, sm, danger, children, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        padding: sm ? "4px 9px" : "5px 11px", fontSize: 11,
        border: danger ? "0.5px solid #fca5a5" : "0.5px solid #d1d5db",
        borderRadius: 7, cursor: disabled ? "not-allowed" : "pointer",
        background: primary ? "#0C447C" : danger ? "#fee2e2" : "transparent",
        color: primary ? "#bfdbfe" : danger ? "#991b1b" : "#111827",
        opacity: disabled ? 0.5 : 1, whiteSpace: "nowrap", fontFamily: "inherit",
      }}
    >
      {children}
    </button>
  );
}

function Input({ value, onChange, placeholder, type = "text", mono }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{
        padding: "5px 8px", fontSize: 11, border: "0.5px solid #d1d5db",
        borderRadius: 6, background: "#fff", color: "#111827", width: "100%",
        fontFamily: mono ? "monospace" : "inherit",
      }}
    />
  );
}

function Select({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={onChange}
      style={{ padding: "5px 8px", fontSize: 11, border: "0.5px solid #d1d5db", borderRadius: 6, background: "#fff", color: "#111827", fontFamily: "inherit" }}
    >
      {options.map((o) => <option key={o}>{o}</option>)}
    </select>
  );
}

function THead({ cols }) {
  return (
    <thead style={{ position: "sticky", top: 0, background: "#fff", zIndex: 1 }}>
      <tr>
        {cols.map(([h, w]) => (
          <th key={h} style={{ padding: "5px 8px", textAlign: "left", fontWeight: 500, fontSize: 10, color: "#6b7280", borderBottom: "0.5px solid #e5e7eb", width: w, whiteSpace: "nowrap" }}>
            {h}
          </th>
        ))}
      </tr>
    </thead>
  );
}

function TD({ children, style }) {
  return <td style={{ padding: "6px 8px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", ...style }}>{children}</td>;
}

function TR({ onClick, children }) {
  const [hover, setHover] = useState(false);
  return (
    <tr
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ borderBottom: "0.5px solid #e5e7eb", cursor: "pointer", background: hover ? "#f9fafb" : "transparent" }}
    >
      {children}
    </tr>
  );
}

// ── ADD / EDIT CONTACT MODAL ──────────────────────────────────────────────────
function ContactModal({ existing, onSave, onClose }) {
  const blank = { lcid: "", name: "", aka: "", legal: "", tract: "", gross: "", or_acres: "", net: "", status: "Offer Mailed", phone: "", email: "", address: "", city: "", state: "", zip: "", redline: "", lp_comments: "" };
  const [form, setForm] = useState(existing ? { ...existing, gross: existing.gross || "", or_acres: existing.or_acres || "", net: existing.net || "" } : blank);
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.name.trim()) return alert("Owner name is required.");
    setSaving(true);
    const payload = {
      ...form,
      gross: parseFloat(form.gross) || 0,
      or_acres: parseFloat(form.or_acres) || null,
      net: parseFloat(form.net) || 0,
      contact_confirmed: !!(form.phone || form.email),
      log: existing?.log || [],
      ups_shipments: existing?.ups_shipments || [],
      curative_items: existing?.curative_items || [],
    };
    await onSave(payload);
    setSaving(false);
    onClose();
  };

  const field = (label, key, opts = {}) => (
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontSize: 10, color: "#6b7280", marginBottom: 3 }}>{label}</div>
      {opts.select
        ? <Select value={form[key]} onChange={(e) => set(key, e.target.value)} options={opts.select} />
        : <Input value={form[key] || ""} onChange={(e) => set(key, e.target.value)} placeholder={opts.placeholder || ""} mono={opts.mono} />
      }
    </div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
      <div style={{ background: "#fff", borderRadius: 12, width: 560, maxHeight: "85vh", overflowY: "auto", padding: 20, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 500 }}>{existing ? "Edit contact" : "Add new contact"}</div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#6b7280" }}>×</button>
        </div>

        <div style={{ fontSize: 11, fontWeight: 500, color: "#6b7280", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>Identification</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {field("LCID", "lcid")}
          {field("Status", "status", { select: ALL_STATUSES })}
        </div>
        {field("Owner name", "name", { placeholder: "Full legal name" })}
        {field("AKA / Heirs of", "aka")}

        <div style={{ fontSize: 11, fontWeight: 500, color: "#6b7280", margin: "12px 0 8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Property</div>
        {field("Legal description", "legal")}
        {field("Tract ID", "tract")}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {field("Gross acres", "gross")}
          {field("OR acres", "or_acres")}
          {field("Net acres", "net")}
        </div>

        <div style={{ fontSize: 11, fontWeight: 500, color: "#6b7280", margin: "12px 0 8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Contact info</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {field("Phone", "phone")}
          {field("Email", "email")}
        </div>
        {field("Address", "address")}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 8 }}>
          {field("City", "city")}
          {field("State", "state")}
          {field("ZIP", "zip")}
        </div>

        <div style={{ fontSize: 11, fontWeight: 500, color: "#6b7280", margin: "12px 0 8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Notes</div>
        {field("Redline", "redline")}
        {field("LP comments", "lp_comments")}

        <div style={{ display: "flex", gap: 8, marginTop: 16, justifyContent: "flex-end" }}>
          <Btn onClick={onClose}>Cancel</Btn>
          <Btn primary onClick={handleSave} disabled={saving}>
            <i className="ti ti-check" style={{ fontSize: 11 }} /> {saving ? "Saving…" : "Save contact"}
          </Btn>
        </div>
      </div>
    </div>
  );
}

// ── DELETE CONFIRM ────────────────────────────────────────────────────────────
function DeleteConfirm({ name, onConfirm, onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
      <div style={{ background: "#fff", borderRadius: 12, padding: 24, width: 360, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 8 }}>Delete contact?</div>
        <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 20 }}>
          This will permanently delete <strong>{name}</strong> and all their activity, curative items, and UPS records. This cannot be undone.
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Btn onClick={onClose}>Cancel</Btn>
          <Btn danger onClick={onConfirm}><i className="ti ti-trash" style={{ fontSize: 11 }} /> Delete permanently</Btn>
        </div>
      </div>
    </div>
  );
}

// ── CONTACT DETAIL ────────────────────────────────────────────────────────────
function ContactDetail({ contact, onBack, onUpdate, onDelete }) {
  const [tab, setTab] = useState("overview");
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [newLog, setNewLog] = useState("");
  const [newUPS, setNewUPS] = useState({ tracking: "", notes: "", date: "", status: "Sent" });
  const [newCur, setNewCur] = useState({ issue: "", priority: "medium" });
  const [saving, setSaving] = useState(false);

  const c = contact;
  const inits = c.name.split(" ").filter((w) => /^[A-Z]/i.test(w)).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
  const col = sc(c.status);

  const today = () => { const t = new Date(); return `${t.getMonth() + 1}/${t.getDate()}/${t.getFullYear()}`; };

  const persist = async (updates) => {
    setSaving(true);
    const { error } = await supabase.from("contacts").update(updates).eq("id", c.id);
    if (!error) onUpdate({ ...c, ...updates });
    setSaving(false);
  };

  const addLog = async () => {
    if (!newLog.trim()) return;
    const entry = { date: today(), text: newLog.trim(), tag: "note" };
    const updated = [entry, ...(c.log || [])];
    await persist({ log: updated });
    setNewLog("");
  };

  const addCur = async () => {
    if (!newCur.issue.trim()) return;
    const entry = { date: today(), issue: newCur.issue.trim(), priority: newCur.priority };
    const updated = [entry, ...(c.curative_items || [])];
    await persist({ curative_items: updated });
    setNewCur({ issue: "", priority: "medium" });
  };

  const addUPS = async () => {
    if (!newUPS.tracking.trim()) return;
    const updated = [{ ...newUPS }, ...(c.ups_shipments || [])];
    await persist({ ups_shipments: updated });
    setNewUPS({ tracking: "", notes: "", date: "", status: "Sent" });
  };

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "log", label: `Activity (${(c.log || []).length})` },
    { id: "ci", label: "Contact info" },
    { id: "cur", label: `Curative (${(c.curative_items || []).length})` },
    { id: "ups", label: `UPS (${(c.ups_shipments || []).length})` },
  ];

  return (
    <>
      {showEdit && <ContactModal existing={c} onSave={async (payload) => { await persist(payload); }} onClose={() => setShowEdit(false)} />}
      {showDelete && <DeleteConfirm name={c.name} onConfirm={async () => { await supabase.from("contacts").delete().eq("id", c.id); onDelete(c.id); }} onClose={() => setShowDelete(false)} />}

      <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
        {/* topbar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 14px", borderBottom: "0.5px solid #e5e7eb", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
            <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#6b7280", padding: 0, fontFamily: "inherit" }}>
              <i className="ti ti-arrow-left" style={{ fontSize: 13 }} /> Back
            </button>
            <span style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</span>
            <Badge color={col}>{c.status}</Badge>
          </div>
          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
            <Btn sm onClick={() => setShowEdit(true)}><i className="ti ti-edit" style={{ fontSize: 11 }} /> Edit</Btn>
            <Btn sm danger onClick={() => setShowDelete(true)}><i className="ti ti-trash" style={{ fontSize: 11 }} /> Delete</Btn>
          </div>
        </div>

        {/* hero */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderBottom: "0.5px solid #e5e7eb", flexShrink: 0 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#E6F1FB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 500, color: "#0C447C", flexShrink: 0 }}>
            {inits || "?"}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{c.name}</div>
            <div style={{ fontSize: 10, color: "#6b7280", marginTop: 2 }}>
              LCID {c.lcid} · Tract {c.tract} · {c.legal}
              {c.aka ? ` · ${c.aka}` : ""}
            </div>
          </div>
        </div>

        {/* tabs */}
        <div style={{ display: "flex", borderBottom: "0.5px solid #e5e7eb", flexShrink: 0, padding: "0 14px", overflowX: "auto" }}>
          {tabs.map((t) => (
            <div key={t.id} onClick={() => setTab(t.id)} style={{ padding: "7px 12px", fontSize: 11, cursor: "pointer", whiteSpace: "nowrap", color: tab === t.id ? "#111827" : "#6b7280", fontWeight: tab === t.id ? 500 : 400, borderBottom: tab === t.id ? "2px solid #185FA5" : "2px solid transparent", marginBottom: -0.5 }}>
              {t.label}
            </div>
          ))}
        </div>

        {/* tab content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px" }}>

          {tab === "overview" && (
            <>
              <Card>
                <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 8 }}>Lease record</div>
                <FieldRow label="LCID" value={c.lcid} />
                <FieldRow label="Legal description" value={c.legal} />
                <FieldRow label="Tract ID" value={c.tract} />
                {c.aka && <FieldRow label="AKA / Heirs of" value={c.aka} />}
                <FieldRow label="Gross acres" value={c.gross ? parseFloat(c.gross).toFixed(4) : null} />
                <FieldRow label="OR acres" value={c.or_acres != null ? parseFloat(c.or_acres).toFixed(5) : null} />
                <FieldRow label="Net acres" value={c.net ? parseFloat(c.net).toFixed(4) : null} />
                <FieldRow label="Status" value={<Badge color={col}>{c.status}</Badge>} />
                {c.redline && <FieldRow label="Redline" value={c.redline} />}
                {c.lp_comments && <FieldRow label="LP notes" value={c.lp_comments} />}
              </Card>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                <StatCard label="Activity entries" value={(c.log || []).length} />
                <StatCard label="UPS shipments" value={(c.ups_shipments || []).length} />
                <StatCard label="Curative items" value={(c.curative_items || []).length} valueColor={(c.curative_items || []).length ? "#A32D2D" : undefined} />
              </div>
            </>
          )}

          {tab === "log" && (
            <>
              <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
                <textarea value={newLog} onChange={(e) => setNewLog(e.target.value)} placeholder="Add activity note…" rows={2}
                  style={{ flex: 1, padding: "6px 8px", fontSize: 11, border: "0.5px solid #d1d5db", borderRadius: 7, resize: "vertical", fontFamily: "inherit" }} />
                <Btn primary onClick={addLog} disabled={saving}><i className="ti ti-plus" style={{ fontSize: 11 }} /> Add</Btn>
              </div>
              {(c.log || []).length ? (c.log || []).map((l, i) => (
                <div key={i} style={{ display: "flex", gap: 8, padding: "7px 0", borderBottom: "0.5px solid #e5e7eb", fontSize: 11 }}>
                  <div style={{ color: "#6b7280", flexShrink: 0, width: 72, fontSize: 10, paddingTop: 1 }}>{l.date}</div>
                  <div style={{ flex: 1, lineHeight: 1.5 }}><TagPill tag={l.tag} />{l.text}</div>
                </div>
              )) : <div style={{ fontSize: 11, color: "#6b7280", paddingTop: 4 }}>No activity logged.</div>}
            </>
          )}

          {tab === "ci" && (
            <Card>
              <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
                Contact details
                <Badge color={c.contact_confirmed ? "green" : "red"}>{c.contact_confirmed ? "Confirmed" : "Unconfirmed"}</Badge>
              </div>
              <FieldRow label="Phone" value={c.phone} />
              <FieldRow label="Email" value={c.email} />
              <FieldRow label="Address" value={c.address} />
              <FieldRow label="City / State / ZIP" value={[c.city, c.state, c.zip].filter(Boolean).join(", ")} />
              <div style={{ marginTop: 10 }}>
                <Btn sm onClick={() => setShowEdit(true)}><i className="ti ti-edit" style={{ fontSize: 11 }} /> Edit contact info</Btn>
              </div>
            </Card>
          )}

          {tab === "cur" && (
            <>
              <Card style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 8 }}>Add curative item</div>
                <textarea value={newCur.issue} onChange={(e) => setNewCur({ ...newCur, issue: e.target.value })} placeholder="Describe the curative issue…" rows={2}
                  style={{ width: "100%", padding: "6px 8px", fontSize: 11, border: "0.5px solid #d1d5db", borderRadius: 6, resize: "vertical", fontFamily: "inherit", marginBottom: 6 }} />
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <Select value={newCur.priority} onChange={(e) => setNewCur({ ...newCur, priority: e.target.value })} options={["high", "medium", "low"]} />
                  <Btn primary sm onClick={addCur} disabled={saving}><i className="ti ti-plus" style={{ fontSize: 11 }} /> Add</Btn>
                </div>
              </Card>
              {(c.curative_items || []).length ? (c.curative_items || []).map((cur, i) => (
                <div key={i} style={{ borderLeft: `3px solid ${cur.priority === "high" ? "#E24B4A" : cur.priority === "medium" ? "#EF9F27" : "#B4B2A9"}`, borderRadius: "0 8px 8px 0", background: "#f9fafb", padding: "8px 10px", marginBottom: 6, fontSize: 11 }}>
                  <div style={{ fontWeight: 500, marginBottom: 3, display: "flex", alignItems: "center", gap: 6 }}>
                    <Badge color={cur.priority === "high" ? "red" : "amber"} sm>{cur.priority}</Badge>
                    {cur.date && <span style={{ fontSize: 10, color: "#6b7280" }}>{cur.date}</span>}
                  </div>
                  <div style={{ color: "#6b7280", lineHeight: 1.5 }}>{cur.issue}</div>
                </div>
              )) : <div style={{ fontSize: 11, color: "#6b7280", paddingTop: 4 }}>No curative items.</div>}
            </>
          )}

          {tab === "ups" && (
            <>
              <Card style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 8 }}>Log shipment</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 6 }}>
                  <input placeholder="Tracking # (1Z…)" value={newUPS.tracking} onChange={(e) => setNewUPS({ ...newUPS, tracking: e.target.value })}
                    style={{ padding: "5px 8px", fontSize: 11, border: "0.5px solid #d1d5db", borderRadius: 6, fontFamily: "monospace" }} />
                  <input placeholder="Date (5/11/2026)" value={newUPS.date} onChange={(e) => setNewUPS({ ...newUPS, date: e.target.value })}
                    style={{ padding: "5px 8px", fontSize: 11, border: "0.5px solid #d1d5db", borderRadius: 6, fontFamily: "inherit" }} />
                  <input placeholder="Notes" value={newUPS.notes} onChange={(e) => setNewUPS({ ...newUPS, notes: e.target.value })}
                    style={{ padding: "5px 8px", fontSize: 11, border: "0.5px solid #d1d5db", borderRadius: 6, fontFamily: "inherit" }} />
                  <Select value={newUPS.status} onChange={(e) => setNewUPS({ ...newUPS, status: e.target.value })} options={["Sent", "In transit", "Delivered", "RTS"]} />
                </div>
                <Btn primary sm onClick={addUPS} disabled={saving}><i className="ti ti-plus" style={{ fontSize: 11 }} /> Log shipment</Btn>
              </Card>
              {(c.ups_shipments || []).length ? (c.ups_shipments || []).map((u, i) => (
                <div key={i} style={{ background: "#f9fafb", borderRadius: 8, padding: "8px 10px", marginBottom: 6 }}>
                  <div style={{ fontFamily: "monospace", fontSize: 10, color: "#185FA5", marginBottom: 3 }}>{u.tracking}</div>
                  <div style={{ fontSize: 10, color: "#6b7280", display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                    <span>{u.notes}</span>
                    {u.date && <span>{u.date}</span>}
                    <Badge color={u.status === "Delivered" ? "green" : u.status === "RTS" ? "red" : "amber"} sm>{u.status}</Badge>
                  </div>
                </div>
              )) : <div style={{ fontSize: 11, color: "#6b7280", paddingTop: 4 }}>No shipments logged.</div>}
            </>
          )}

        </div>
      </div>
    </>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("dashboard");
  const [sel, setSel] = useState(null);
  const [search, setSearch] = useState("");
  const [statusF, setStatusF] = useState("All");
  const [showAdd, setShowAdd] = useState(false);

  // Load from Supabase
  useEffect(() => {
    async function load() {
      const { data, error } = await supabase.from("contacts").select("*").order("name");
      if (!error && data) setContacts(data);
      setLoading(false);
    }
    load();
  }, []);

  const handleAdd = async (payload) => {
    const { data, error } = await supabase.from("contacts").insert([payload]).select();
    if (!error && data) setContacts((prev) => [...prev, data[0]].sort((a, b) => a.name.localeCompare(b.name)));
  };

  const handleUpdate = useCallback((updated) => {
    setContacts((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setSel(updated);
  }, []);

  const handleDelete = useCallback((id) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
    setSel(null);
    setView("cru");
  }, []);

  const filtered = useMemo(() =>
    contacts.filter((c) => {
      const q = search.toLowerCase();
      return (
        (!q || c.name?.toLowerCase().includes(q) || c.lcid?.includes(q) || c.legal?.toLowerCase().includes(q) || c.tract?.includes(q)) &&
        (statusF === "All" || c.status === statusF)
      );
    }), [contacts, search, statusF]);

  const allStatuses = useMemo(() => ["All", ...Array.from(new Set(contacts.map((c) => c.status))).sort()], [contacts]);

  const stats = useMemo(() => {
    const sc2 = {}; let cu = 0, up = 0, cc = 0;
    contacts.forEach((c) => {
      sc2[c.status] = (sc2[c.status] || 0) + 1;
      cu += (c.curative_items || []).length;
      up += (c.ups_shipments || []).length;
      if (c.contact_confirmed) cc++;
    });
    return { sc: sc2, cu, up, cc };
  }, [contacts]);

  const selContact = sel;

  // ── SIDEBAR ──
  const NavBtn = ({ id, icon, label, indent }) => {
    const active = view === id && !selContact;
    return (
      <div onClick={() => { setView(id); setSel(null); }}
        style={{ display: "flex", alignItems: "center", gap: 7, padding: `6px 12px 6px ${indent ? "22px" : "12px"}`, cursor: "pointer", fontSize: 12, borderRadius: 6, margin: "0 5px", color: active ? "#111827" : "#6b7280", background: active ? "#fff" : "transparent", fontWeight: active ? 500 : 400 }}>
        <i className={`ti ${icon}`} style={{ fontSize: indent ? 13 : 14 }} />
        {label}
      </div>
    );
  };

  const Hdr = ({ title, badge, action }) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 14px", borderBottom: "0.5px solid #e5e7eb", flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 500 }}>{title}</span>
        {badge && <span style={{ background: "#E6F1FB", color: "#0C447C", padding: "1px 7px", borderRadius: 10, fontSize: 10 }}>{badge}</span>}
      </div>
      {action}
    </div>
  );

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontSize: 13, color: "#6b7280" }}>
      <i className="ti ti-loader" style={{ fontSize: 24, marginRight: 8 }} /> Loading DMC…
    </div>
  );

  return (
    <>
      {showAdd && <ContactModal onSave={handleAdd} onClose={() => setShowAdd(false)} />}

      <div style={{ display: "flex", height: "100vh", background: "#fff", fontFamily: "'Inter', system-ui, sans-serif" }}>

        {/* SIDEBAR */}
        <div style={{ width: 215, borderRight: "0.5px solid #e5e7eb", display: "flex", flexDirection: "column", background: "#f9fafb", flexShrink: 0 }}>
          <div style={{ padding: "14px 14px 12px", borderBottom: "0.5px solid #e5e7eb" }}>
            <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.3px" }}>
              <i className="ti ti-map-2" style={{ fontSize: 14, verticalAlign: -1, marginRight: 6 }} />DMC
            </div>
            <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 2 }}>Landman management</div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "6px 0" }}>
            <NavBtn id="dashboard" icon="ti-layout-dashboard" label="Dashboard" />
            <div style={{ height: 8 }} />
            <div style={{ padding: "6px 12px 3px", fontSize: 10, fontWeight: 500, color: "#9ca3af", letterSpacing: "0.5px", textTransform: "uppercase" }}>Clients</div>
            <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 12px", fontSize: 12, fontWeight: 500, color: "#111827" }}>
              <i className="ti ti-building-bank" style={{ fontSize: 14 }} />TLC
              <span style={{ background: "#E6F1FB", color: "#0C447C", padding: "1px 6px", borderRadius: 10, fontSize: 10, marginLeft: 2 }}>{contacts.length}</span>
            </div>
            <NavBtn id="cru" icon="ti-clipboard-list" label="CRU" indent />
            <NavBtn id="contacts" icon="ti-address-book" label="Confirmed contacts" indent />
            <NavBtn id="curative" icon="ti-clipboard-check" label="Curative list" indent />
            <NavBtn id="ups" icon="ti-package" label="UPS tracker" indent />
          </div>
        </div>

        {/* MAIN */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>

          {selContact ? (
            <ContactDetail contact={selContact} onBack={() => setSel(null)} onUpdate={handleUpdate} onDelete={handleDelete} />
          ) : view === "dashboard" ? (
            <>
              <Hdr title="Dashboard" />
              <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 12 }}>
                  <StatCard label="Total contacts" value={contacts.length} sub="TLC project" />
                  <StatCard label="Confirmed contacts" value={stats.cc} sub="have phone/email" valueColor="#3B6D11" />
                  <StatCard label="Curative items" value={stats.cu} sub="across all records" valueColor={stats.cu ? "#A32D2D" : undefined} />
                  <StatCard label="UPS shipments" value={stats.up} sub="logged" />
                </div>

                <Card>
                  <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 8 }}>Status breakdown — TLC</div>
                  {Object.entries(stats.sc).sort((a, b) => b[1] - a[1]).map(([s, n]) => (
                    <div key={s} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0", borderBottom: "0.5px solid #e5e7eb", fontSize: 11 }}>
                      <span style={{ color: "#6b7280" }}>{s}</span>
                      <Badge color={sc(s)}>{n}</Badge>
                    </div>
                  ))}
                </Card>

                {contacts.some((c) => (c.curative_items || []).length > 0) && (
                  <Card>
                    <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 8 }}>Contacts needing curative action</div>
                    {contacts.filter((c) => (c.curative_items || []).length > 0).slice(0, 10).map((c) => (
                      <div key={c.id} onClick={() => setSel(c)} style={{ padding: "4px 0", borderBottom: "0.5px solid #e5e7eb", cursor: "pointer", fontSize: 11, display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontWeight: 500, color: "#185FA5", width: 65, flexShrink: 0 }}>{c.lcid}</span>
                        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</span>
                        <Badge color="red" sm>{(c.curative_items || []).length} item{(c.curative_items || []).length > 1 ? "s" : ""}</Badge>
                      </div>
                    ))}
                  </Card>
                )}
              </div>
            </>
          ) : view === "cru" ? (
            <>
              <Hdr title="CRU" badge="TLC" action={
                <Btn primary sm onClick={() => setShowAdd(true)}>
                  <i className="ti ti-plus" style={{ fontSize: 11 }} /> Add record
                </Btn>
              } />
              <div style={{ display: "flex", gap: 6, padding: "8px 14px", borderBottom: "0.5px solid #e5e7eb", flexShrink: 0 }}>
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, LCID, legal…"
                  style={{ flex: 1, padding: "5px 9px", fontSize: 11, border: "0.5px solid #d1d5db", borderRadius: 7, fontFamily: "inherit" }} />
                <Select value={statusF} onChange={(e) => setStatusF(e.target.value)} options={allStatuses} />
              </div>
              <div style={{ flex: 1, overflowY: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, tableLayout: "fixed" }}>
                  <THead cols={[["LCID", 65], ["Owner name", 170], ["Tract", 65], ["OR acres", 65], ["Net acres", 68], ["Status", 130], ["Last entry", 82], ["", 20]]} />
                  <tbody>
                    {filtered.map((c) => (
                      <TR key={c.id} onClick={() => setSel(c)}>
                        <TD style={{ fontWeight: 500, color: "#185FA5" }}>{c.lcid}</TD>
                        <TD style={{ fontWeight: 500 }}>{c.name}</TD>
                        <TD>{c.tract}</TD>
                        <TD>{c.or_acres != null ? parseFloat(c.or_acres).toFixed(4) : "—"}</TD>
                        <TD>{c.net ? parseFloat(c.net).toFixed(3) : "—"}</TD>
                        <TD><Badge color={sc(c.status)}>{c.status}</Badge></TD>
                        <TD style={{ color: "#6b7280", fontSize: 10 }}>{(c.log || [])[0]?.date || "—"}</TD>
                        <TD><i className="ti ti-chevron-right" style={{ fontSize: 11, color: "#9ca3af" }} /></TD>
                      </TR>
                    ))}
                  </tbody>
                </table>
                {filtered.length === 0 && <div style={{ padding: 20, textAlign: "center", color: "#9ca3af", fontSize: 11 }}>No records match.</div>}
              </div>
            </>
          ) : view === "contacts" ? (
            <>
              <Hdr title="Confirmed contacts" badge="TLC" />
              <div style={{ flex: 1, overflowY: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, tableLayout: "fixed" }}>
                  <THead cols={[["LCID", 65], ["Name", 155], ["Phone", 110], ["Email", 130], ["Address", 160], ["Confirmed", 74]]} />
                  <tbody>
                    {contacts.map((c) => (
                      <TR key={c.id} onClick={() => setSel(c)}>
                        <TD style={{ fontWeight: 500, color: "#185FA5" }}>{c.lcid}</TD>
                        <TD style={{ fontWeight: 500 }}>{c.name}</TD>
                        <TD>{c.phone || "—"}</TD>
                        <TD style={{ color: "#185FA5", fontSize: 10 }}>{c.email || "—"}</TD>
                        <TD style={{ color: "#6b7280" }}>{[c.address, c.city, c.state].filter(Boolean).join(", ")}</TD>
                        <TD><Badge color={c.contact_confirmed ? "green" : "red"}>{c.contact_confirmed ? "Yes" : "No"}</Badge></TD>
                      </TR>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : view === "curative" ? (
            <>
              <Hdr title="Curative list" badge="TLC" />
              <div style={{ flex: 1, overflowY: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, tableLayout: "fixed" }}>
                  <THead cols={[["LCID", 65], ["Owner", 150], ["Issue"], ["Priority", 72], ["Date", 80]]} />
                  <tbody>
                    {contacts.flatMap((c) =>
                      (c.curative_items || []).map((cur, ki) => (
                        <TR key={`${c.id}-${ki}`} onClick={() => setSel(c)}>
                          <TD style={{ fontWeight: 500, color: "#185FA5" }}>{c.lcid}</TD>
                          <TD style={{ fontWeight: 500 }}>{c.name}</TD>
                          <TD style={{ color: "#6b7280" }}>{cur.issue?.slice(0, 100)}</TD>
                          <TD><Badge color={cur.priority === "high" ? "red" : "amber"}>{cur.priority}</Badge></TD>
                          <TD style={{ color: "#6b7280", fontSize: 10 }}>{cur.date}</TD>
                        </TR>
                      ))
                    )}
                  </tbody>
                </table>
                {contacts.every((c) => !(c.curative_items || []).length) && <div style={{ padding: 20, textAlign: "center", color: "#9ca3af", fontSize: 11 }}>No curative items.</div>}
              </div>
            </>
          ) : view === "ups" ? (
            <>
              <Hdr title="UPS label tracker" badge="TLC" />
              <div style={{ flex: 1, overflowY: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, tableLayout: "fixed" }}>
                  <THead cols={[["LCID", 65], ["Recipient", 140], ["Tracking #", 162], ["Notes"], ["Date", 75], ["Status", 78]]} />
                  <tbody>
                    {contacts.flatMap((c) =>
                      (c.ups_shipments || []).map((u, ui) => (
                        <TR key={`${c.id}-${ui}`} onClick={() => setSel(c)}>
                          <TD style={{ fontWeight: 500, color: "#185FA5" }}>{c.lcid}</TD>
                          <TD style={{ fontWeight: 500 }}>{c.name}</TD>
                          <TD style={{ fontFamily: "monospace", fontSize: 10, color: "#185FA5" }}>{u.tracking}</TD>
                          <TD style={{ color: "#6b7280" }}>{u.notes}</TD>
                          <TD style={{ color: "#6b7280", fontSize: 10 }}>{u.date}</TD>
                          <TD><Badge color={u.status === "Delivered" ? "green" : u.status === "RTS" ? "red" : "amber"}>{u.status}</Badge></TD>
                        </TR>
                      ))
                    )}
                  </tbody>
                </table>
                {contacts.every((c) => !(c.ups_shipments || []).length) && <div style={{ padding: 20, textAlign: "center", color: "#9ca3af", fontSize: 11 }}>No UPS shipments.</div>}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </>
  );
}