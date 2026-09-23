"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import JSZip from "jszip";
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
  const [batchCount, setBatchCount] = useState(10);
const [batchCreating, setBatchCreating] = useState(false);
  const [lastBatchCodes, setLastBatchCodes] = useState<string[]>([]);
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
async function createBatch() {
  const count = Math.max(1, Math.min(500, batchCount));
const createdCodes: string[] = [];
  setBatchCreating(true);

  try {
    for (let i = 0; i < count; i++) {
      const res = await fetch("/api/cards", {
        method: "POST",
        body: JSON.stringify({}),
      });

      if (!res.ok) {
        throw new Error(`No se pudo crear la tarjeta ${i + 1}`);
      }
    const data = await res.json();
createdCodes.push(data.card.code);
}
    setLastBatchCodes(createdCodes);
    await loadCards();
    alert(`Lote de ${count} tarjetas creado correctamente`);
  } catch (err) {
    alert(err instanceof Error ? err.message : "No se pudo crear el lote");
  } finally {
    setBatchCreating(false);
  }
}
async function downloadLastBatch() {
  if (lastBatchCodes.length === 0) {
    alert("Primero crea un lote de tarjetas");
    return;
  }

  const zip = new JSZip();

  for (const code of lastBatchCodes) {
    const url = `${baseUrl}/r/${code}`;

    const dataUrl = await QRCode.toDataURL(url, {
      margin: 1,
      width: 1000,
    });

    const base64 = dataUrl.split(",")[1];
    zip.file(`${code}.png`, base64, { base64: true });
  }

  const blob = await zip.generateAsync({ type: "blob" });
  const downloadUrl = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = downloadUrl;
  a.download = `lote-qr-${lastBatchCodes[0]}-${lastBatchCodes[lastBatchCodes.length - 1]}.zip`;
  a.click();

  URL.revokeObjectURL(downloadUrl);
}
  
  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <main className="wrap">
      <header className="topbar">
<h1>Panel QR</h1>       
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
</div>
<button className="primary" onClick={createCard}>
  + Nueva tarjeta
</button>
    <div className="batchbox">
  <label htmlFor="batchCount">Crear lote de QR</label>

  <input
  id="batchCount"
  type="number"
  min="1"
  max="500"
  value={batchCount}
  onChange={(e) => setBatchCount(Number(e.target.value))}
/>
<button
  className="ghost"
  type="button"
  onClick={createBatch}
  disabled={batchCreating}
>
  {batchCreating ? "Generando..." : "Generar lote"}
</button>
  <button
  className="ghost"
  type="button"
  onClick={downloadLastBatch}
  disabled={lastBatchCodes.length === 0}
>
  Descargar lote
</button>
</div>  

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
          {card.status === "asignada" ? "Activa" : "Disponible"}
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
