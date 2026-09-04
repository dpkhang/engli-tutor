import { DataLoadingState } from "@/features/layout";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-5xl py-6">
      <DataLoadingState
        title="Opening your workspace"
        description="Fetching the latest content and getting your page ready."
        cards={3}
      />
    </div>
  );
}
