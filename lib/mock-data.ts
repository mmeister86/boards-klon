import type { Project } from "@/lib/types";

export const mockProjects: Project[] = [
  {
    id: "project-1",
    title: "Startseite",
    description:
      "Unternehmens-Startseite mit Hero-Bereich, Funktionen und Kontaktformular",
    createdAt: new Date(2023, 10, 15).toISOString(),
    updatedAt: new Date(2023, 11, 2).toISOString(),
    thumbnail: "/placeholder.svg?height=200&width=400",
    blocks: 12,
  },
  {
    id: "project-2",
    title: "Produkt-Dashboard",
    description: "Admin-Dashboard für Produktverwaltung mit Analysen",
    createdAt: new Date(2023, 9, 20).toISOString(),
    updatedAt: new Date(2023, 10, 25).toISOString(),
    thumbnail: "/placeholder.svg?height=200&width=400",
    blocks: 8,
  },
  {
    id: "project-3",
    title: "Blog-Layout",
    description:
      "Blog-Seite mit Seitenleiste, ausgewählten Beiträgen und Newsletter-Anmeldung",
    createdAt: new Date(2023, 8, 5).toISOString(),
    updatedAt: new Date(2023, 9, 18).toISOString(),
    thumbnail: "/placeholder.svg?height=200&width=400",
    blocks: 15,
  },
  {
    id: "project-4",
    title: "E-Commerce Produktseite",
    description:
      "Produktdetailseite mit Bildergalerie, Spezifikationen und Warenkorb-Funktionalität",
    createdAt: new Date(2023, 7, 12).toISOString(),
    updatedAt: new Date(2023, 8, 30).toISOString(),
    thumbnail: "/placeholder.svg?height=200&width=400",
    blocks: 10,
  },
  {
    id: "project-5",
    title: "Portfolio-Vorlage",
    description:
      "Persönliches Portfolio mit Projektpräsentation und Kontaktinformationen",
    createdAt: new Date(2023, 6, 25).toISOString(),
    updatedAt: new Date(2023, 7, 15).toISOString(),
    thumbnail: "/placeholder.svg?height=200&width=400",
    blocks: 7,
  },
];
