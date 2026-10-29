"use client";

import { cn } from "@engli-tutor/ui";

/** Round avatar: profile image when available, otherwise initials. */
export function OverviewAvatar({
  image,
  initials,
  className,
}: {
  image: string | null;
  initials: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid shrink-0 place-items-center overflow-hidden rounded-full bg-primary/10 font-semibold text-primary",
        className,
      )}
    >
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" className="size-full object-cover" referrerPolicy="no-referrer" />
      ) : (
        initials
      )}
    </span>
  );
}
