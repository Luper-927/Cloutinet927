"use client";
import { useState } from "react";

const EXAMPLES = [
  "Which customers haven't paid me recently?",
  "Summarize my business activity",
  "Which products are unpublished?",
];

export default function AssistantPage() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  async function ask(q: string) {
    if (!q.trim()) return;
    setLoading(true);
    setAnswer("");
    try {
      const res = await fetch("/api/chief-of-staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const json = await res.json();
      setAnswer(json.answer || json.error || "No response");
    } catch {
      setAnswer("Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: 16 }}>
      <h1 style={{ fontSize: 22, marginBottom: 4 }}>AI Chief of Staff</h1>
      <p style={{ color: "#666", marginBottom: 16 }}>
        Ask questions about your customers, payments, products and documents.
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
        {EXAMPLES.map((e) => (
          <button
            key={e}
            onClick={() => { setQuestion(e); ask(e); }}
            style={{ padding: "6px 10px", borderRadius: 16, border: "1px solid #ddd", background: "#fff", fontSize: 13 }}
          >
            {e}
          </button>
        ))}
      </div>

      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask anything about your business..."
        rows={3}
        maxLength={500}
        style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd", fontSize: 16, boxSizing: "border-box" }}
      />
      <button
        onClick={() => ask(question)}
        disabled={loading}
        style={{ marginTop: 8, padding: "10px 18px", borderRadius: 8, border: "none", background: "#111", color: "#fff", fontSize: 15 }}
      >
        {loading ? "Thinking..." : "Ask"}
      </button>

      {answer && (
        <div style={{ marginTop: 16, padding: 14, borderRadius: 8, background: "#f6f6f6", whiteSpace: "pre-wrap", lineHeight: 1.5 }}>
          {answer}
        </div>
      )}
    </div>
  );
}
