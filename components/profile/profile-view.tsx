"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

// Placeholder component for Profile View
export default function ProfileView() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Supabase Client initialisieren
  const supabase = getSupabaseBrowserClient();

  // Benutzerdaten laden
  useEffect(() => {
    async function loadUserData() {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error) throw error;

        if (user) {
          setEmail(user.email || "");
          // Display Name aus den Metadaten laden
          setName(
            user.user_metadata?.display_name ||
              user.user_metadata?.full_name ||
              ""
          );
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        setMessage({
          type: "error",
          text: "Fehler beim Laden der Benutzerdaten",
        });
      }
    }

    loadUserData();
  }, [supabase.auth]);

  // Name aktualisieren
  const handleUpdateProfile = async () => {
    try {
      setIsLoading(true);
      setMessage(null);

      const { error } = await supabase.auth.updateUser({
        data: {
          display_name: name,
          full_name: name, // Synchronisiere display_name mit full_name für die Boards
        },
      });

      if (error) throw error;

      setMessage({ type: "success", text: "Profil erfolgreich aktualisiert" });
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({
        type: "error",
        text: "Fehler beim Aktualisieren des Profils",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Profil</h1>
      <Card>
        <CardHeader>
          <CardTitle>Profilinformationen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {message && (
            <Alert
              variant={message.type === "success" ? "default" : "destructive"}
            >
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Ihr Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} readOnly />
          </div>
          <Button onClick={handleUpdateProfile} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Wird gespeichert...
              </>
            ) : (
              "Änderungen speichern"
            )}
          </Button>
        </CardContent>
      </Card>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Passwort ändern</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Aktuelles Passwort</Label>
            <Input id="current-password" type="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">Neues Passwort</Label>
            <Input id="new-password" type="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Neues Passwort bestätigen</Label>
            <Input id="confirm-password" type="password" />
          </div>
          <Button>Passwort ändern</Button>
        </CardContent>
      </Card>
    </div>
  );
}
