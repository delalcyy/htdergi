import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const user = await getSessionUser(req);
  if (!user || user.role !== "ADMIN") return new NextResponse("Yetkisiz", { status: 401 });

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    select: { id: true, notes: true, user: { select: { firstName: true, lastName: true, seriNo: true } } },
  }).catch(() => null);

  if (!order) return new NextResponse("Bulunamadı", { status: 404 });

  let notesData: { personName?: string; coverBase64?: string } = {};
  try { if (order.notes) notesData = JSON.parse(order.notes); } catch { /**/ }
  if (!notesData.coverBase64) return new NextResponse("Kapak yok", { status: 404 });

  const personName = notesData.personName
    || `${order.user.firstName ?? ""} ${order.user.lastName ?? ""}`.trim()
    || "Kapak";

  /* Arka kapak base64 — diskten oku */
  let arkaKapakDataUrl = "";
  try {
    const ayar = await prisma.dergiAyar.findFirst({ where: { id: 1 } });
    if (ayar?.arkaKapakUrl) {
      const dosyaYolu = path.join(process.cwd(), "public", ayar.arkaKapakUrl);
      const buf = await readFile(dosyaYolu);
      const ext = ayar.arkaKapakUrl.split(".").pop()?.toLowerCase() ?? "jpg";
      const mime = ext === "png" ? "image/png" : "image/jpeg";
      arkaKapakDataUrl = `data:${mime};base64,${buf.toString("base64")}`;
    }
  } catch { /* arka kapak yoksa boş kalır */ }

  const onKapakSrc = notesData.coverBase64;
  const seriNo = order.user.seriNo ?? "";

  const html = `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="utf-8"/>
<title>Kapak — ${personName.replace(/[<>&"]/g, "")}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0;}
body{background:#c8c8c8;display:flex;flex-direction:column;align-items:center;padding:20px 0 36px;gap:16px;font-family:Arial,sans-serif;}
.no-print{display:flex;gap:10px;align-self:flex-start;margin-left:16px;align-items:center;}
.btn{padding:8px 18px;border:none;cursor:pointer;font-size:13px;font-family:inherit;border-radius:3px;}
.btn-print{background:#111;color:#fff;}
.btn-close{background:#ddd;color:#333;}
.info{font-size:12px;color:#555;align-self:flex-start;margin-left:16px;}
.wrap{background:#fff;box-shadow:0 3px 16px rgba(0,0,0,.25);line-height:0;}
.wrap canvas{display:block;max-width:96vw;height:auto;}
@page{size:435mm 285mm landscape;margin:0;}
@media print{
  .no-print,.info{display:none;}
  html,body{margin:0;padding:0;background:#fff;}
  .wrap{box-shadow:none;width:100vw;}
  .wrap canvas{width:100%;height:auto;}
}
</style>
</head>
<body>
<div class="no-print">
  <button id="bp" class="btn btn-print">PDF Olarak Kaydet</button>
  <button id="bc" class="btn btn-close">Kapat</button>
</div>
<p class="info" id="inf">Hazirlanıyor...</p>
<div class="wrap" id="wr"></div>
<script>
var ON = ${JSON.stringify(onKapakSrc)};
var AK = ${JSON.stringify(arkaKapakDataUrl || null)};

function loadImg(src, cb) {
  if (!src) { cb(null); return; }
  var img = new Image();
  img.onload = function(){ cb(img); };
  img.onerror = function(){ cb(null); };
  img.src = src;
}

loadImg(ON, function(onImg) {
  if (!onImg) {
    document.getElementById('inf').textContent = 'Hata: Kapak yuklenmedi.';
    return;
  }
  loadImg(AK, function(akImg) {
    var kW = onImg.naturalWidth;
    var kH = onImg.naturalHeight;
    var sW = Math.round(kW * 5 / 215);
    var cv = document.createElement('canvas');
    cv.width = kW + sW + kW;
    cv.height = kH;
    var ctx = cv.getContext('2d');

    if (akImg) {
      ctx.drawImage(akImg, 0, 0, kW, kH);
    } else {
      ctx.fillStyle = '#eeeeee';
      ctx.fillRect(0, 0, kW, kH);
    }
    ctx.fillStyle = '#111111';
    ctx.fillRect(kW, 0, sW, kH);
    ctx.drawImage(onImg, kW + sW, 0, kW, kH);

    document.getElementById('wr').appendChild(cv);
    document.getElementById('inf').textContent = 'Hazir — PDF olarak kaydetmek icin "PDF Olarak Kaydet" butonuna tiklayin.';

    document.getElementById('bp').onclick = function(){ window.print(); };
    document.getElementById('bc').onclick = function(){ window.close(); };
  });
});
</script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
