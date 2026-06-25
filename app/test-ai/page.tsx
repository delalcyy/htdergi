"use client";

import { useState } from "react";

const DEFAULT_PROMPT = "Make a realistic photo, match lighting, depth, perspective. No collage look. Seamless blend.";

export default function TestAI() {
  const [imageUrl, setImageUrl] = useState("");
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [raw, setRaw] = useState<string | null>(null);
  const [ms, setMs] = useState<number | null>(null);

  async function generate() {
    if (!imageUrl.trim()) return;
    setLoading(true);
    setResult(null);
    setError(null);
    setRaw(null);

    const t0 = Date.now();
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: imageUrl.trim(), prompt }),
      });

      const data = await res.json();
      setRaw(JSON.stringify(data, null, 2));
      setMs(Date.now() - t0);

      if (!res.ok) {
        setError(data.error ?? `HTTP ${res.status}`);
      } else {
        setResult(data.url);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Fetch hatası");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 760, margin: "40px auto", padding: "0 20px", fontFamily: "monospace" }}>
      <h1 style={{ fontSize: 20, marginBottom: 24 }}>🧪 Replicate API Test</h1>

      {/* Inputs */}
      <label style={labelStyle}>Image URL</label>
      <input
        value={imageUrl}
        onChange={e => setImageUrl(e.target.value)}
        placeholder="https://..."
        style={inputStyle}
      />

      <label style={labelStyle}>Prompt</label>
      <textarea
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        rows={3}
        style={{ ...inputStyle, resize: "vertical" }}
      />

      <button onClick={generate} disabled={loading || !imageUrl.trim()} style={btnStyle}>
        {loading ? "⏳ Üretiliyor... (30–60 sn)" : "🚀 Generate"}
      </button>

      {/* Süre */}
      {ms !== null && (
        <p style={{ fontSize: 12, color: "#666", marginTop: 8 }}>⏱ {(ms / 1000).toFixed(1)} saniye</p>
      )}

      {/* Hata */}
      {error && (
        <div style={{ marginTop: 20, padding: 14, background: "#fff0f0", border: "1px solid #f99", borderRadius: 6 }}>
          <strong>❌ Hata:</strong>
          <pre style={{ margin: "8px 0 0", fontSize: 13, whiteSpace: "pre-wrap" }}>{error}</pre>
        </div>
      )}

      {/* Sonuç */}
      {result && (
        <div style={{ marginTop: 24 }}>
          <p style={{ marginBottom: 8, fontSize: 13 }}>✅ Sonuç:</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={result} alt="AI çıktısı" style={{ maxWidth: "100%", borderRadius: 8, border: "1px solid #ddd" }} />
          <p style={{ fontSize: 12, marginTop: 8, wordBreak: "break-all", color: "#555" }}>{result}</p>
          <a href={result} target="_blank" rel="noreferrer"
            style={{ fontSize: 13, color: "#2563eb" }}>Yeni sekmede aç ↗</a>
        </div>
      )}

      {/* Ham yanıt */}
      {raw && (
        <details style={{ marginTop: 24 }}>
          <summary style={{ cursor: "pointer", fontSize: 13, color: "#888" }}>Ham API yanıtı</summary>
          <pre style={{ marginTop: 8, padding: 12, background: "#f5f5f5", borderRadius: 6, fontSize: 12, overflowX: "auto" }}>
            {raw}
          </pre>
        </details>
      )}

      {/* curl örneği */}
      <details style={{ marginTop: 32 }}>
        <summary style={{ cursor: "pointer", fontSize: 13, color: "#888" }}>curl komutu</summary>
        <pre style={{ marginTop: 8, padding: 12, background: "#1e1e1e", color: "#d4d4d4", borderRadius: 6, fontSize: 12, overflowX: "auto" }}>
{`curl -X POST http://localhost:3000/api/generate \\
  -H "Content-Type: application/json" \\
  -d '{
    "imageUrl": "${imageUrl || "https://example.com/foto.jpg"}",
    "prompt": "${prompt.replace(/"/g, '\\"')}"
  }'`}
        </pre>
      </details>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4, marginTop: 16, color: "#333",
};
const inputStyle: React.CSSProperties = {
  display: "block", width: "100%", padding: "10px 12px", fontSize: 13,
  border: "1px solid #ccc", borderRadius: 6, boxSizing: "border-box", fontFamily: "monospace",
};
const btnStyle: React.CSSProperties = {
  marginTop: 20, padding: "12px 28px", background: "#111", color: "#fff",
  border: "none", borderRadius: 6, fontSize: 14, cursor: "pointer", fontWeight: 600,
};
