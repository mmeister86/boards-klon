"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

// Placeholder component for Profile View
export default function ProfileView() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Profil</h1>
      <Card>
        <CardHeader>
          <CardTitle>Profilinformationen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Ihr Name"
              defaultValue="Meister Matthias"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Ihre Email"
              defaultValue="meister.matthias86@gmail.com"
              readOnly
            />
          </div>
          <Button>Änderungen speichern</Button>
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
