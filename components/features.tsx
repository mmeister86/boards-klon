import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Zap, Shield, BarChart, Users, Globe, Layers } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Blitzschnell",
    description:
      "Unsere optimierte Plattform garantiert maximale Leistung Ihrer Anwendung mit minimaler Latenz.",
  },
  {
    icon: Shield,
    title: "Sicherheit standardmäßig",
    description:
      "Enterprise-Grade-Sicherheit mit Ende-zu-Ende-Verschlüsselung und fortschrittlichem Bedrohungsschutz.",
  },
  {
    icon: BarChart,
    title: "Detaillierte Analysen",
    description:
      "Gewinnen Sie wertvolle Einblicke durch umfassende Analysen und anpassbare Dashboards.",
  },
  {
    icon: Users,
    title: "Team-Zusammenarbeit",
    description:
      "Arbeiten Sie nahtlos mit Ihrem Team zusammen, indem Sie unsere kollaborativen Tools und Funktionen nutzen.",
  },
  {
    icon: Globe,
    title: "Globales CDN",
    description:
      "Content Delivery Network garantiert schnelle Ladezeiten für Nutzer auf der ganzen Welt.",
  },
  {
    icon: Layers,
    title: "Skalierbare Infrastruktur",
    description:
      "Skalieren Sie Ihre Anwendung einfach mit wachsendem Nutzerstamm ohne Leistungseinbußen.",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-20 bg-muted/50">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Leistungsstarke Funktionen
          </h2>
          <p className="text-muted-foreground text-lg">
            Unsere Plattform ist vollgepackt mit leistungsstarken Funktionen,
            die Ihnen helfen, Ihre Anwendung zu entwickeln und zu wachsen.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="border-border/40 bg-background/60 backdrop-blur-sm"
            >
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
