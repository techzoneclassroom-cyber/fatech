"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// The header survives client navigation, so close the phone menu on route change.
export function Menu({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDetailsElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (ref.current) ref.current.open = false;
  }, [pathname]);

  return <details className="menu" ref={ref}>{children}</details>;
}
