import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

function esc(s: string) {
  return String(s ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function imgSlot(src: string | null, cls: string, label: string) {
  const inner = src
    ? `<img src="${src}" alt="" />`
    : `<div class="img-ph"><span class="img-ph-i">□</span><span class="img-ph-l">${label}</span></div>`;
  return `<div class="${cls}">${inner}</div>`;
}

function dropCapBlock(num: number, qText: string, answer: string | undefined | null) {
  const a = answer?.trim() || null;
  return `
<div class="dc-wrap">
  <div class="dc-left">
    <span class="dc-num">${String(num).padStart(2, "0")}</span>
    <span class="dc-letter">${a ? esc(a[0].toUpperCase()) : "—"}</span>
  </div>
  <span class="dc-q">${esc(qText)}</span>
  ${a ? `<span class="dc-a">${esc(a.slice(1))}</span>` : `<span class="dc-ph">—</span>`}
</div>`;
}

function qaBlock(num: number, qText: string, answer: string | undefined | null) {
  const a = answer?.trim() || null;
  return `
<span class="qa-num">${String(num).padStart(2, "0")}</span>
<span class="qa-q">${esc(qText)}</span>
${a ? `<span class="qa-a">${esc(a)}</span>` : `<span class="qa-ph">—</span>`}`;
}

export async function GET(req: NextRequest, { params }: Params) {
  const user = await getSessionUser(req);
  if (!user || user.role !== "ADMIN") return new NextResponse("Yetkisiz", { status: 401 });

  const { id } = await params;

  const draft = await prisma.interviewDraft.findUnique({
    where: { id },
    include: {
      category: { include: { questions: { where: { isActive: true }, orderBy: { orderIndex: "asc" } } } },
      user: { select: { firstName: true, lastName: true, email: true, seriNo: true } },
      answers: true,
    },
  }).catch(() => null);

  if (!draft) return new NextResponse("Bulunamadı", { status: 404 });

  const order = await prisma.order.findFirst({
    where: { notes: { contains: id } },
    select: { notes: true },
  }).catch(() => null);

  let photo1: string | null = null;
  let photo2: string | null = null;
  let personNameFromOrder: string | null = null;
  if (order?.notes) {
    try {
      const n = JSON.parse(order.notes);
      photo1 = n.photo1Base64 ?? null;
      photo2 = n.photo2Base64 ?? null;
      personNameFromOrder = n.personName ?? null;
    } catch { /**/ }
  }

  const answerMap = Object.fromEntries(draft.answers.map(a => [a.questionId, a.answerText]));
  const personName = personNameFromOrder
    || `${draft.user.firstName ?? ""} ${draft.user.lastName ?? ""}`.trim()
    || draft.user.email;
  const seriNo = draft.user.seriNo ?? "";
  const cat = draft.category.name;
  const qs  = draft.category.questions;
  const ttlLen = personName.length;
  const tSz = ttlLen > 40 ? 28 : ttlLen > 28 ? 34 : ttlLen > 18 ? 38 : 44;

  function buildPage(
    qs5: typeof qs,
    startIdx: number,
    img1: string | null,
    img2: string | null,
    pgN: number,
    useDc: boolean
  ) {
    const slots = qs5.map((q, i) => ({ q, n: startIdx + i + 1 }));
    const [s1, s2, s3, s4, s5] = slots;
    return `
<div class="page">
  <div class="mh">
    <span class="mh-cat">Hatıra Dergi</span>
    <span class="mh-ttl" style="font-size:${tSz}px">${esc(personName)}</span>
    <div class="mh-rule"></div>
  </div>
  <div class="top-sec">
    <div class="top-qs">
      <div class="qs-slot">
        ${s1 ? (useDc ? dropCapBlock(s1.n, s1.q.body, answerMap[s1.q.id]) : qaBlock(s1.n, s1.q.body, answerMap[s1.q.id])) : ""}
      </div>
      <div class="qs-slot">
        ${s2 ? qaBlock(s2.n, s2.q.body, answerMap[s2.q.id]) : ""}
      </div>
      <div class="qs-slot">
        ${s3 ? qaBlock(s3.n, s3.q.body, answerMap[s3.q.id]) : ""}
      </div>
    </div>
    ${imgSlot(img1, "top-img", "Görsel 1")}
  </div>
  <div class="sep"></div>
  <div class="bot-sec">
    ${imgSlot(img2, "bot-img", "Görsel 2")}
    <div class="bot-qs">
      <div class="qs-slot-b">
        ${s4 ? qaBlock(s4.n, s4.q.body, answerMap[s4.q.id]) : ""}
      </div>
      <div class="qs-slot-b">
        ${s5 ? qaBlock(s5.n, s5.q.body, answerMap[s5.q.id]) : ""}
      </div>
    </div>
  </div>
  <div class="footer">
    <span class="f-l">Hatıra Dergi</span>
    <span class="f-m">${esc(cat)}</span>
    <span class="f-r">${seriNo ? esc(seriNo) + " · " : ""}${String(pgN).padStart(2, "0")}</span>
  </div>
</div>`;
  }

  const page1Html = buildPage(qs.slice(0, 5), 0, photo1, photo2, 1, true);
  const page2Html = buildPage(qs.slice(5, 10), 5, photo1, photo2, 2, false);

  const CSS = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body {
  background: #d0d0d0;
  font-family: 'Palatino Linotype','Book Antiqua',Palatino,Georgia,serif;
  color: #111;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
  padding: 24px 0 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}
.no-print { display: flex; gap: 10px; align-self: flex-start; margin-left: 20px; }
.btn { padding: 8px 20px; border: none; cursor: pointer; font-size: 13px; font-family: inherit; }
.btn-print { background: #111; color: #fff; }
.btn-close  { background: #eee; color: #333; }
.page {
  width: 794px; height: 1123px; overflow: hidden;
  page-break-after: always; background: #fff;
  padding: 44px 48px; display: flex; flex-direction: column; gap: 0;
  box-shadow: 0 2px 12px rgba(0,0,0,0.18);
}
.mh { flex-shrink: 0; margin-bottom: 14px; }
.mh-cat {
  font-family: Arial, sans-serif; font-size: 10px; font-weight: 800;
  letter-spacing: .28em; text-transform: uppercase; color: #C9A96E;
  display: flex; align-items: center; gap: 10px; margin-bottom: 6px;
}
.mh-cat::after {
  content: ''; display: block; height: 2px; width: 60px;
  background: #C9A96E; flex-shrink: 0;
}
.mh-ttl { font-style: italic; font-weight: 700; line-height: 1.0; color: #111; letter-spacing: -.3px; word-break: break-word; display: block; }
.mh-rule { height: 1px; background: #111; margin-top: 10px; }
.top-sec { flex-shrink: 0; height: 440px; display: flex; gap: 18px; overflow: hidden; margin-top: 14px; }
.top-qs { width: 420px; height: 440px; flex-shrink: 0; overflow: hidden; display: flex; flex-direction: column; }
.qs-slot { flex: 1; overflow: hidden; padding: 10px 0 8px; border-top: 1px solid #e0e0e0; }
.qs-slot:first-child { border-top: none; padding-top: 0; }
.top-img { width: 260px; height: 280px; flex-shrink: 0; overflow: hidden; background: #ddd; position: relative; align-self: flex-start; }
.top-img img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center; display: block; }
.sep { flex-shrink: 0; height: 18px; }
.bot-sec { flex-shrink: 0; height: 290px; display: flex; gap: 18px; overflow: hidden; }
.bot-img { width: 240px; height: 220px; flex-shrink: 0; overflow: hidden; background: #ddd; position: relative; align-self: flex-start; }
.bot-img img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center; display: block; }
.bot-qs { flex: 1; height: 290px; overflow: hidden; display: flex; flex-direction: column; }
.qs-slot-b { flex: 1; overflow: hidden; padding: 10px 0 8px; border-top: 1px solid #e0e0e0; }
.qs-slot-b:first-child { border-top: none; padding-top: 0; }
.footer { flex-shrink: 0; margin-top: auto; border-top: 1px solid #111; padding-top: 8px; display: flex; align-items: center; justify-content: space-between; }
.f-l { font-family: Arial, sans-serif; font-size: 8px; font-weight: 700; letter-spacing: .22em; text-transform: uppercase; color: #bbb; }
.f-m { font-size: 10px; font-style: italic; color: #888; }
.f-r { font-size: 14px; font-weight: 700; color: #111; }
.img-ph { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; background: #efefef; }
.img-ph-i { font-size: 20px; color: #ccc; }
.img-ph-l { font-family: Arial, sans-serif; font-size: 7.5px; letter-spacing: .12em; text-transform: uppercase; color: #bbb; }
.dc-wrap { display: grid; grid-template-columns: 58px 1fr; grid-template-rows: auto auto; column-gap: 10px; align-items: start; }
.dc-left { grid-column: 1; grid-row: 1 / 3; display: flex; flex-direction: column; align-items: flex-start; }
.dc-num { font-family: Arial, sans-serif; font-size: 9px; color: #bbb; letter-spacing: .1em; font-weight: 400; display: block; margin-bottom: 1px; line-height: 1; }
.dc-letter { font-size: 72px; font-weight: 900; font-style: italic; line-height: 0.82; color: #111; font-family: 'Palatino Linotype',Palatino,Georgia,serif; display: block; }
.dc-q { grid-column: 2; grid-row: 1; font-size: 12.5px; font-weight: 700; font-style: italic; color: #111; line-height: 1.38; display: block; padding-top: 10px; margin-bottom: 4px; }
.dc-a { grid-column: 2; grid-row: 2; font-family: Arial,Helvetica,sans-serif; font-size: 11px; line-height: 1.72; color: #333; word-break: break-word; overflow-wrap: break-word; display: block; }
.dc-ph { grid-column: 2; grid-row: 2; font-family: Arial, sans-serif; font-size: 10px; color: #ccc; font-style: italic; display: block; }
.qa-num { font-family: Arial, sans-serif; font-size: 9px; color: #bbb; letter-spacing: .1em; font-weight: 400; display: block; margin-bottom: 4px; }
.qa-q { font-size: 12.5px; font-weight: 700; font-style: italic; color: #111; line-height: 1.38; display: block; margin-bottom: 4px; }
.qa-a { font-family: Arial,Helvetica,sans-serif; font-size: 11px; line-height: 1.72; color: #333; word-break: break-word; overflow-wrap: break-word; display: block; }
.qa-ph { font-family: Arial, sans-serif; font-size: 10px; color: #ccc; font-style: italic; display: block; }
@media print {
  .no-print { display: none; }
  body { background: #fff; padding: 0; gap: 0; }
  .page { box-shadow: none; }
  @page { margin: 0; size: 794px 1123px; }
}`;

  const html = `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="utf-8" />
<title>Röportaj — ${esc(personName)}</title>
<style>${CSS}</style>
</head>
<body>
<div class="no-print">
  <button id="btn-yazdir" class="btn btn-print">🖨️ PDF Olarak Yazdır / İndir</button>
  <button id="btn-kapat"  class="btn btn-close">Kapat</button>
</div>
${page1Html}${page2Html}
<script>
window.addEventListener('load', function() {
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
