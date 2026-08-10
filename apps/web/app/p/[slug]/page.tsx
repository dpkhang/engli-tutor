import { PublicLanding } from "@/features/landing-pages/ui/public-landing";

export default async function PublicLandingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <PublicLanding slug={slug} />;
}
