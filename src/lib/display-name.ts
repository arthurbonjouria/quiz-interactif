// Format d'affichage public (écran projeté) : "Prénom N." — on n'affiche jamais
// le nom de famille complet en dehors du back-office/export RH.
export function formatDisplayName(firstName: string, lastName: string): string {
  const initial = lastName.trim().charAt(0).toUpperCase();
  return initial ? `${firstName} ${initial}.` : firstName;
}
