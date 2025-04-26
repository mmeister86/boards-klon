"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import Apple from "@/components/icons/Apple";
import Google from "@/components/icons/Google";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { signUp, signInWithProvider } from "@/app/auth/actions";

export default function SignUpPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleEmailSignUp = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signUp(formData);

      if (result.error) {
        setError(result.error);
      } else if (result.success) {
        setSuccess(result.success);
        // Clear the form
        const emailInput = document.querySelector(
          'input[type="email"]'
        ) as HTMLInputElement;
        if (emailInput) emailInput.value = "";
      }
    } catch (error) {
      console.error("Signup error:", error);
      setError("Ein unerwarteter Fehler ist aufgetreten");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      await signInWithProvider("google");
    } catch (error) {
      console.error("Google signup error:", error);
      setError("Ein Fehler ist bei der Registrierung mit Google aufgetreten");
    }
  };

  const handleAppleSignUp = async () => {
    try {
      await signInWithProvider("apple");
    } catch (error) {
      console.error("Apple signup error:", error);
      setError("Ein Fehler ist bei der Registrierung mit Apple aufgetreten");
    }
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Left side with illustration */}
      <div
        className="flex flex-1 items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/auth-min.jpg')" }}
      >
        <div className="text-center pb-40">
          <Link href="/">
            <h1 className="text-white text-7xl font-bold mb-2">
              Platzhalter Logo
            </h1>
          </Link>
          <p className="text-white text-xl font-bold text-center">
            Boards Klon hilft dir, deinen Marketing Content themenbezogen in
            Boards zu organisieren.
          </p>
        </div>
      </div>

      {/* Right side with form */}
      <div className="flex flex-1 items-center justify-center bg-gray-50 p-8">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Registrieren</h1>
            <p className="text-gray-600">
              Erstellen Sie ein Konto und starten Sie noch heute
            </p>
          </div>

          <div className="flex gap-4">
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={handleGoogleSignUp}
              disabled={isLoading}
            >
              <Google />
              Mit Google
            </Button>
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={handleAppleSignUp}
              disabled={isLoading}
            >
              <Apple />
              Mit Apple
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-gray-50 px-2 text-gray-500">
                oder mit E-Mail
              </span>
            </div>
          </div>

          <form action={handleEmailSignUp} className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="E-Mail"
                required
                disabled={isLoading}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full bg-black hover:bg-gray-800"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Wird gesendet...
                </>
              ) : (
                "Registrieren"
              )}
            </Button>
          </form>

          <div className="text-center text-sm">
            Bereits ein Konto?{" "}
            <Link href="/sign-in" className="font-medium underline">
              Hier anmelden
            </Link>
            <p className="mt-2">
              Zurück zur{" "}
              <Link href="/" className="font-medium underline">
                Startseite
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
