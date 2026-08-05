import { DemoLanding } from "@/features/landing-pages/ui/demo-landing";

export default async function DemoLandingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <DemoLanding slug={slug} />;
}
