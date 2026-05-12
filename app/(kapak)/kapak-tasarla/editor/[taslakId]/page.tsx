import KapakEditorWrapper from "@/components/kapak/KapakEditorWrapper";

export const metadata = { title: "Kapak Düzenle | Hatıra Dergi" };

type Props = { params: Promise<{ taslakId: string }> };

export default async function EditorPage({ params }: Props) {
  const { taslakId } = await params;
  return <KapakEditorWrapper taslakId={taslakId} />;
}
