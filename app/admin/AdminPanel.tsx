"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { CardData, DestType } from "@/lib/types";

const DEST_LABELS: Record<DestType, string> = {
  google: "Reseñas de Google",
  instagram: "Instagram",
  url: "Enlace personalizado",
};

const DEST_PLACEHOLDERS: Record<DestType, string> = {
  google: "Pega aquí el enlace de reseñas de Google",
  instagram: "Pega aquí el enlace de Instagram",
  url: "Pega aquí el enlace de destino",
};

export default function AdminPanel() {
  const [cards, setCards] = useState<CardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [openCode, setOpenCode] = useState<string | null>(null);
  const [baseUrl, setBaseUrl] = useState("");
const availableCount = cards.filter((card) => card.status === "libre").length;

const activeCount = cards.filter((card) => card.status === "asignada").length;

const totalScans = cards.reduce((sum, card) => sum + (card.scans || 0), 0);
  useEffect(() => {
    setBaseUrl(window.location.origin);
    loadCards();
  }, []);

  async function loadCards() {
    setLoading(true);
    const res = await fetch("/api/cards");
    const data = await res.json();
    setCards(data.cards || []);
    setLoading(false);
  }

  async function createCard() {
    const res = await fetch("/api/cards", { method: "POST", body: JSON.stringify({}) });
    if (res.ok) {
      const data = await res.json();
      await loadCards();
      setOpenCode(data.card.code);
    } else {
      const err = await res.json();
      alert(err.error || "No se pudo crear la tarjeta");
    }
  }

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <main className="wrap">
      <header className="topbar">
        <h1>Panel de Tarjetas</h1>
        <button className="ghost" onClick={logout}>
          Salir
        </button>
      </header>


<div className="stats">
  <div className="stat">
    <strong>{availableCount}</strong>
    <span>Disponibles</span>
  </div>

  <div className="stat">
    <strong>{activeCount}</strong>
    <span>Activas</span>
  </div>

  <div className="stat">
    <strong>{totalScans}</strong>
    <span>Escaneos</span>
  </div>

<button className="primary" onClick={createCard}>
  + Nueva tarjeta
</button>
      

      {loading ? (
      <p className="muted">Cargando...</p>  
      ) : (
        <ul className="cardlist">
          {cards.map((c) => (
            <CardRow
              key={c.code}
              card={c}
              baseUrl={baseUrl}
              open={openCode === c.code}
              onToggle={() => setOpenCode(openCode === c.code ? null : c.code)}
              onSaved={loadCards}
            />
          ))}
        </ul>
      )}
    </main>
  );
}

function CardRow({
  card,
  baseUrl,
  open,
  onToggle,
  onSaved,
}: {
  card: CardData;
  baseUrl: string;
  open: boolean;
  onToggle: () => void;
  onSaved: () => void;
}) {
  const [localName, setLocalName] = useState(card.localName);
  const [destType, setDestType] = useState<DestType>(card.destType);
  const [destValue, setDestValue] = useState(card.destValue);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qr, setQr] = useState<string | null>(null);

  const scanUrl = `${baseUrl}/r/${card.code}`;

  useEffect(() => {
    if (open && baseUrl) {
      QRCode.toDataURL(scanUrl, { margin: 1, width: 320 }).then(setQr);
    }
  }, [open, scanUrl, baseUrl]);

  async function save() {
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/cards/${card.code}`, {
      method: "PUT",
      body: JSON.stringify({ localName, destType, destValue }),
    });
    setSaving(false);
    if (res.ok) {
      onSaved();
    } else {
      const err = await res.json();
      setError(err.error || "No se pudo guardar");
    }
  }

  async function remove() {
    if (!confirm(`¿Borrar la tarjeta ${card.code}?`)) return;
    await fetch(`/api/cards/${card.code}`, { method: "DELETE" });
    onSaved();
  }

  function downloadQr() {
    if (!qr) return;
    const a = document.createElement("a");
    a.href = qr;
    a.download = `qr-${card.code}.png`;
    a.click();
  }

  return (
    <li className="card">
      <button className="cardhead" onClick={onToggle}>
        <span className="code">{card.code}</span>
        <span className={`badge ${card.status}`}>
          {card.status === "asignada" ? "Asignada" : "Libre"}
        </span>
        <span className="scans">{card.scans || 0} escaneos</span>
      </button>

      {open && (
        <div className="cardbody">
          <label>Nombre del local</label>
          <input
            value={localName}
            onChange={(e) => setLocalName(e.target.value)}
            placeholder="Café Rivas"
          />

          <label>Tipo de destino</label>
          <select value={destType} onChange={(e) => setDestType(e.target.value as DestType)}>
            <option value="google">Reseña de Google</option>
            <option value="instagram">Instagram</option>
            <option value="url">URL directa</option>
          </select>

          <label>{DEST_LABELS[destType]}</label>
          <input
            value={destValue}
            onChange={(e) => setDestValue(e.target.value)}
            placeholder={DEST_PLACEHOLDERS[destType]}
          />

          {error && <p className="err">{error}</p>}

          <div className="row">
            <button className="primary" onClick={save} disabled={saving} style={{ marginBottom: 0 }}>
              {saving ? "Guardando…" : "Asignar esta tarjeta"}
            </button>
            {card.destUrl && (
              <a className="ghost" href={card.destUrl} target="_blank" rel="noreferrer">
                Probar destino
              </a>
            )}
          </div>

          <div className="qrbox">
            <p className="muted">Este QR apunta a: {scanUrl}</p>
            {qr && <img src={qr} alt={`QR ${card.code}`} width={160} height={160} />}
            {qr && (
              <div>
                <button className="ghost" onClick={downloadQr}>
                  Descargar QR
                </button>
              </div>
            )}
          </div>

          <button className="danger" onClick={remove}>
            Borrar tarjeta
          </button>
        </div>
      )}
    </li>
  );
}
