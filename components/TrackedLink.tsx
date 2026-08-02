"use client";

import { ReactNode } from "react";
import { trackEvent } from "@/lib/analytics";

interface TrackedLinkProps {
  href: string | undefined;
  action: string;
  params?: Record<string, unknown>;
  className?: string;
  target?: string;
  children: ReactNode;
}

export default function TrackedLink({
  href,
  action,
  params,
  className,
  target = "_blank",
  children,
}: TrackedLinkProps) {
  return (
    <a
      href={href}
      target={target}
      rel={target === "_blank" ? "noopener noreferrer" : undefined}
      className={className}
      onClick={() => trackEvent(action, params)}
    >
      {children}
    </a>
  );
}
