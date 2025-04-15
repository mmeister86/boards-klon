"use client";

interface PublicViewportWrapperProps {
  children: React.ReactNode;
}

export function PublicViewportWrapper({
  children,
}: PublicViewportWrapperProps) {
  return <div className="container mx-auto p-4">{children}</div>;
}
