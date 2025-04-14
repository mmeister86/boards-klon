import { redirect } from "next/navigation";

export default function DashboardPage() {
  // Automatische Weiterleitung zu /dashboard/projekte
  redirect("/dashboard/projekte");
}
