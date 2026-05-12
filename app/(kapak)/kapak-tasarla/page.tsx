import { redirect } from "next/navigation";

export const metadata = { title: "Kapak Tasarla | Hatıra Dergi" };

export default function KapakTasarlaPage() {
  redirect("/kapak-tasarla/editor");
}
