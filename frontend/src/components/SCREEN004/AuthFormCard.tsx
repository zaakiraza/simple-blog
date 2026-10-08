import type { ReactNode } from "react";
import { Card } from "../Shared";

/** Centered auth card: title on top, the login form inside (the /signup link comes from AuthFrame). */
export function AuthFormCard({
  title,
  children,
  className = "",
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={"w-full max-w-md p-8 shadow-sm " + className}>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
      {children}
    </Card>
  );
}
