// Logo officiel BONJOUR IA (fichiers dans /public/logo).
// "dark" = version noire+rose, pour fonds clairs. "light" = version blanche+rose, pour fonds sombres (bg-ink).
export function Logo({
  variant = "dark",
  className = "h-8",
}: {
  variant?: "dark" | "light";
  className?: string;
}) {
  const src = variant === "light" ? "/logo/logo-blanc-rose.svg" : "/logo/logo-noir-rose.svg";

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="BONJOUR IA" className={className} />;
}
