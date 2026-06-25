import React from "react";
import KapakEditorWrapper from "@/components/kapak/KapakEditorWrapper";

export const metadata = { title: "Kapak Düzenle | Amedspor × Hatıra Dergi" };

type Props = { params: Promise<{ taslakId: string }> };

const AMED_VARSAYILAN_YAZILAR = {
  sol1: "Yeni Sezon, Yeni Zaferler",
  sag1: "Amedspor'un Yükseliş Hikâyesi",
  sol2: "Tribünlerin Sesi, Diyarbakır'ın Gururu",
  sag2: "Bu Hikâye Taraftarla Yazılıyor",
} as const;

const AMED_LOGO_STYLE: React.CSSProperties = {
  top: 0,
  left: 0,
  right: 0,
  padding: 0,
  width: "100%",
  height: "auto",
  overflow: "visible",
  display: "block",
};

const AMED_LOGO_IMG_STYLE: React.CSSProperties = {
  width: "100%",
  height: "auto",
  display: "block",
  margin: 0,
  padding: 0,
};

export default async function AmedsporEditorPage({ params }: Props) {
  const { taslakId } = await params;
  return (
    <KapakEditorWrapper
      taslakId={taslakId}
      logoSrc="/amedspor/logo1.png"
      logoStyle={AMED_LOGO_STYLE}
      logoImgStyle={AMED_LOGO_IMG_STYLE}
      logoEmblemGenis={0.22}
      varsayilanYaziMetinleri={AMED_VARSAYILAN_YAZILAR}
      sadeceOnKapak
    />
  );
}
