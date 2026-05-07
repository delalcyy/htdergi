export default function AdminLoading() {
  return (
    <div>
      <div
        style={{
          height: "1.5rem",
          width: "160px",
          background: "#e2e8f0",
          borderRadius: "6px",
          marginBottom: "1.5rem",
          animation: "pulse 1.5s ease-in-out infinite",
        }}
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              background: "#f1f5f9",
              borderRadius: "10px",
              height: "80px",
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          />
        ))}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1rem",
        }}
      >
        {[1, 2].map((i) => (
          <div
            key={i}
            style={{
              background: "#f1f5f9",
              borderRadius: "10px",
              height: "200px",
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          />
        ))}
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
