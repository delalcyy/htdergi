import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const user = await getSessionUser(req);
  if (!user || user.role !== "ADMIN") return new NextResponse("Yetkisiz", { status: 401 });

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    select: { id: true, notes: true, user: { select: { firstName: true, lastName: true } } },
  }).catch(() => null);

  if (!order) return new NextResponse("Bulunamadı", { status: 404 });

  let notesData: { personName?: string; coverBase64?: string } = {};
  try { if (order.notes) notesData = JSON.parse(order.notes); } catch { /**/ }
  if (!notesData.coverBase64) return new NextResponse("Kapak yok", { status: 404 });

  const personName = notesData.personName
    || `${order.user.firstName ?? ""} ${order.user.lastName ?? ""}`.trim()
    || "Kapak";

  const html = `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="utf-8" />
<title>Kapak — ${personName}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0;}
body{background:#c8c8c8;display:flex;flex-direction:column;align-items:center;padding:20px 0 36px;gap:16px;font-family:Arial,sans-serif;}
.no-print{display:flex;gap:10px;align-self:flex-start;margin-left:16px;}
.btn{padding:8px 18px;border:none;cursor:pointer;font-size:13px;font-family:inherit;border-radius:3px;}
.btn-print{background:#111;color:#fff;}
.btn-close{background:#ddd;color:#333;}
.wrap{background:#fff;box-shadow:0 3px 16px rgba(0,0,0,.25);line-height:0;}
.wrap img{display:block;width:100%;height:auto;}
@media print{
  .no-print{display:none;}
  html,body{margin:0;padding:0;background:#fff;width:100%;height:100%;}
  .wrap{box-shadow:none;width:100%;height:100%;display:flex;align-items:center;justify-content:center;}
  .wrap img{width:100%;height:100%;object-fit:fill;display:block;}
  @page{margin:0;size:auto;}
}
</style>
</head>
<body>
<div class="no-print">
  <button id="btn-yazdir" class="btn btn-print">🖨️ PDF Olarak Yazdır / İndir</button>
  <button id="btn-kapat"  class="btn btn-close">Kapat</button>
</div>
<div class="wrap">
  <img src="${notesData.coverBase64}" alt="${personName} kapak" />
</div>
<script>
window.addEventListener('load', function() {
  var img = document.querySelector('.wrap img');
  if (img && img.naturalWidth) {
    var s = document.createElement('style');
    s.textContent = '@media print { @page { margin:0; size:' + img.naturalWidth + 'px ' + img.naturalHeight + 'px; } }';
    document.head.appendChild(s);
  }
  document.getElementById('btn-yazdir').onclick = function() { window.print(); };
  document.getElementById('btn-kapat').onclick  = function() { window.close(); };
  setTimeout(function() { window.print(); }, 500);
});
</script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
