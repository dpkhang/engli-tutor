import type { Metadata } from "next";
import { PublicLanding } from "@/features/public-landing/public-landing";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: slug.replace(/-/g, " "),
    robots: { index: true, follow: true },
  };
}

export default async function PublicLandingPage({ params }: Props) {
  const { slug } = await params;
  return <PublicLanding slug={slug} />;
}
