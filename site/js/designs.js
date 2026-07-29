export const DENOMINATIONS = [5, 10, 20, 50, 100, 200];

export const DESIGNS = [
  { id: "A", designer: "Studio Joost Grootens", theme: "culture" },
  { id: "B", designer: "PunktFormStrich", theme: "nature" },
  { id: "C", designer: "Neue Gestaltung GmbH", theme: "culture" },
  { id: "D", designer: "Rudy Guedj & François Girard-Meunier", theme: "nature" },
  { id: "E", designer: "Myrsini Vardopoulou", theme: "culture" },
  { id: "F", designer: "Jan Robert Dünnweller", theme: "culture" },
  { id: "G", designer: "Rubio & del Amo and Cruz más Cruz", theme: "culture" },
  { id: "H", designer: "Atelier Goppel-Toperngpong", theme: "nature" },
  { id: "I", designer: "Isabelle Daëron", theme: "nature" },
  { id: "J", designer: "Ville Tietäväinen", theme: "nature" },
];

export function imagePath(id, denomination, side) {
  return `./assets/banknotes/banknote-design-proposal-${id.toLowerCase()}-${denomination}-${side}.jpg`;
}
