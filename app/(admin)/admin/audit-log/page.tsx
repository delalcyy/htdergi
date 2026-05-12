import { prisma } from "@/lib/prisma";

export const metadata = { title: "Audit Log | Admin" };

type Props = {
  searchParams: Promise<{ islem?: string; sayfa?: string }>;
};

const PAGE_SIZE = 50;

export default async function AuditLogPage({ searchParams }: Props) {
  const params = await searchParams;
  const islem = params.islem || "";
  const sayfa = parseInt(params.sayfa || "1", 10);
  const skip = (sayfa - 1) * PAGE_SIZE;

  const where = islem ? { action: { contains: islem } } : {};

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: PAGE_SIZE,
      include: {
        actor: { select: { email: true, firstName: true, lastName: true, role: true } },
      },
    }),
    prisma.auditLog.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      <h1 className="admin-section-title">Audit Log</h1>

      <div className="admin-filters">
        <form method="GET" action="/admin/audit-log">
          <input
            name="islem"
            defaultValue={islem}
            placeholder="İşlem tipine göre filtrele..."
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              padding: "0.375rem 0.75rem",
              fontSize: "0.8125rem",
              outline: "none",
              width: "280px",
            }}
          />
        </form>
        <span style={{ fontSize: "0.8125rem", color: "#94a3b8" }}>Toplam: {total} kayıt</span>
      </div>

      <div className="admin-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tarih</th>
                <th>Aktör</th>
                <th>İşlem</th>
                <th>Hedef</th>
                <th>IP</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td style={{ fontSize: "0.75rem", color: "#94a3b8", whiteSpace: "nowrap" }}>
                    {new Date(log.createdAt).toLocaleString("tr-TR")}
                  </td>
                  <td style={{ fontSize: "0.8125rem" }}>
                    {log.actor.email}
                    <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>{log.actor.role}</div>
                  </td>
                  <td>
                    <code style={{ fontSize: "0.75rem", background: "#f1f5f9", padding: "0.125rem 0.375rem", borderRadius: "4px", color: "#0f172a" }}>
                      {log.action}
                    </code>
                  </td>
                  <td style={{ fontSize: "0.75rem", color: "#64748b" }}>
                    {log.targetType && <span>{log.targetType}: </span>}
                    {log.targetId && <code style={{ fontFamily: "monospace" }}>{log.targetId.slice(0, 8)}...</code>}
                  </td>
                  <td style={{ fontSize: "0.75rem", color: "#94a3b8", fontFamily: "monospace" }}>
                    {log.ipAddress || "—"}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", color: "#94a3b8", padding: "2rem" }}>Kayıt yok.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", marginTop: "1rem" }}>
            {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map((p) => (
              <a
                key={p}
                href={`/admin/audit-log?islem=${islem}&sayfa=${p}`}
                className={`admin-filter-btn ${p === sayfa ? "active" : ""}`}
                style={{ padding: "0.25rem 0.625rem", minWidth: "32px", textAlign: "center", textDecoration: "none" }}
              >
                {p}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
