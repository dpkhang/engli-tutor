import { redirect } from "next/navigation";

export default async function LessonProgressRedirectPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect(`/${locale}/progress`);
}
