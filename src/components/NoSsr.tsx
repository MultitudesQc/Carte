"use client";

import React, {type PropsWithChildren} from "react";
import { useMounted } from "@/lib/useMounted";

export function NoSsr({ children }: PropsWithChildren) {
  const mounted = useMounted();
  if (!mounted) return null;
  return <>{children}</>;
}