import { FrameTryPreview } from "@/features/landing-pages/ui/frame-try-preview";

export default async function TemplatePreviewPage({
  params,
}: {
  params: Promise<{ frameId: string }>;
}) {
  const { frameId } = await params;
  return <FrameTryPreview frameId={frameId} />;
}
