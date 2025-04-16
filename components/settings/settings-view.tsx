"use client";

import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Placeholder component for Settings View
export default function SettingsView() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Einstellungen</h1>

      <Card>
        <CardHeader>
          <CardTitle>Allgemein</CardTitle>
          <CardDescription>Allgemeine Anwendungseinstellungen.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between space-x-2">
            <Label
              htmlFor="language-select"
              className="flex flex-col space-y-1"
            >
              <span>Sprache</span>
              <span className="font-normal leading-snug text-muted-foreground">
                Wählen Sie Ihre bevorzugte Sprache.
              </span>
            </Label>
            <Select defaultValue="de">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sprache wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="de">Deutsch</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Benachrichtigungen</CardTitle>
          <CardDescription>
            Verwalten Sie Ihre Benachrichtigungseinstellungen.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between space-x-2">
            <Label
              htmlFor="email-notifications"
              className="flex flex-col space-y-1"
            >
              <span>Email Benachrichtigungen</span>
              <span className="font-normal leading-snug text-muted-foreground">
                Erhalten Sie Emails über wichtige Aktivitäten.
              </span>
            </Label>
            <Switch id="email-notifications" defaultChecked />
          </div>
          <div className="flex items-center justify-between space-x-2">
            <Label
              htmlFor="push-notifications"
              className="flex flex-col space-y-1"
            >
              <span>Push Benachrichtigungen</span>
              <span className="font-normal leading-snug text-muted-foreground">
                Erhalten Sie Push-Benachrichtigungen auf Ihren Geräten.
              </span>
            </Label>
            <Switch id="push-notifications" />
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 flex justify-end">
        <Button>Einstellungen speichern</Button>
      </div>
    </div>
  );
}
