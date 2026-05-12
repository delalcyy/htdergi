export default function PanelLoading() {
  return (
    <div style={{ padding: "2rem" }}>
      <div
        style={{
          height: "1.5rem",
          width: "180px",
          background: "#e5e7eb",
          borderRadius: "6px",
          marginBottom: "1.5rem",
          animation: "pulse 1.5s ease-in-out infinite",
        }}
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              background: "#f3f4f6",
              borderRadius: "12px",
              height: "90px",
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          />
        ))}
      </div>
      <div
        style={{
          background: "#f3f4f6",
          borderRadius: "12px",
          height: "120px",
          animation: "pulse 1.5s ease-in-out infinite",
        }}
      />
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
