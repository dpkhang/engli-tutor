import { LandingPageDetail } from "@/features/landing-pages/ui/landing-page-detail";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function LandingPageDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <LandingPageDetail id={id} />;
}
