import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const plans = [
  {
    name: "Kostenlos",
    price: "0€",
    description: "Perfekt für den Einstieg und persönliche Projekte",
    features: [
      "Bis zu 3 Projekte",
      "Basis-Vorlagen",
      "Community-Support",
      "Kernfunktionen",
      "1GB Speicherplatz",
    ],
    cta: "Jetzt starten",
    popular: false,
  },
  {
    name: "Premium",
    price: "49,99€",
    period: "unbefristete Lizenz für ein Jahr",
    description: "Alles, was du für professionelle Entwicklung brauchst",
    features: [
      "Unbegrenzte Projekte",
      "Alle Vorlagen",
      "Prioritäts-Support",
      "Erweiterte Funktionen",
      "50GB Speicherplatz",
      "Eigene Domains",
      "Team-Zusammenarbeit",
      "API-Zugriff",
    ],
    cta: "Jetzt upgraden",
    popular: true,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-20">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Einfache, transparente Preise
          </h2>
          <p className="text-muted-foreground text-lg">
            Wähle den Plan, der zu dir passt, und beginne noch heute mit dem
            Aufbau erstaunlicher Projekte.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative ${
                plan.popular
                  ? "border-primary shadow-lg shadow-primary/10 scale-105"
                  : "border-border/40"
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
                  <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                    EMPFOHLEN
                  </span>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="mt-4 flex items-baseline text-5xl font-extrabold">
                  {plan.price}
                  {plan.period && (
                    <span className="ml-1 text-sm font-medium text-muted-foreground">
                      {plan.period}
                    </span>
                  )}
                </div>
                <CardDescription className="mt-4 text-base">
                  {plan.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mr-3" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                  size="lg"
                >
                  {plan.cta}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8 text-xs text-muted-foreground leading-tight">
          <p>
            Alle Pläne beinhalten eine 14-tägige Geld-zurück-Garantie. Keine
            Fragen gestellt.
          </p>
          <p className="mt-1">
            Benötigst du einen individuellen Plan für dein Unternehmen?{" "}
            <a href="#" className="text-primary hover:underline">
              Kontaktiere uns
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
