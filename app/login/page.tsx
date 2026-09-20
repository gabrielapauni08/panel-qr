"use client";

import { useState, FormEvent } from "react";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/login", {
      method: "POST",
      body: JSON.stringify({ password }),
    });

    setLoading(false);

    if (res.ok) {
      window.location.href = "/admin";
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Contraseña incorrecta");
    }
  }

  return (
    <main className="wrap center">
      <form className="loginbox" onSubmit={submit}>
        <h1>Panel de Tarjetas</h1>
        <label>Contraseña</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
        />
        {error && <p className="err">{error}</p>}
        <button className="primary" type="submit" disabled={loading}>
          {loading ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </main>
  );
}
