export default function PublicLandingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <main className="min-h-svh">{children}</main>;
}
