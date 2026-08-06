import { LandingPageContentEditor } from "@/features/landing-pages";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditLandingPageContent({ params }: PageProps) {
  const { id } = await params;
  return <LandingPageContentEditor id={id} />;
}
