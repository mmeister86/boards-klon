"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import Apple from "@/components/icons/Apple";
import Google from "@/components/icons/Google";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          router.replace("/dashboard");
          return;
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        router.replace("/dashboard");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase.auth]);

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error: loginError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        },
      });

      if (loginError) {
        setError(loginError.message);
      } else {
        setSuccess(
          "Magic Link wurde gesendet! Bitte überprüfen Sie Ihre E-Mails."
        );
        setEmail("");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Ein unerwarteter Fehler ist aufgetreten");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error: googleError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        },
      });
      if (googleError) setError(googleError.message);
    } catch (error) {
      console.error("Google login error:", error);
      setError("Ein Fehler ist beim Login mit Google aufgetreten");
    }
  };

  const handleAppleLogin = async () => {
    try {
      const { error: appleError } = await supabase.auth.signInWithOAuth({
        provider: "apple",
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        },
      });
      if (appleError) setError(appleError.message);
    } catch (error) {
      console.error("Apple login error:", error);
      setError("Ein Fehler ist beim Login mit Apple aufgetreten");
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
            <h1 className=" text-white text-7xl font-bold mb-2">
              Platzhalter Logo
            </h1>
          </Link>
          <p className=" text-white text-xl font-bold text-center">
            Boards Klon hilft dir, deinen Marketing Content themenbezogen in
            Boards zu organisieren.
          </p>
        </div>
      </div>

      {/* Right side with form */}
      <div className="flex flex-1 items-center justify-center bg-gray-50 p-8">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Anmelden</h1>
            <p className="text-gray-600">Willkommen zurück!</p>
          </div>

          <div className="flex gap-4">
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              <Google />
              Mit Google
            </Button>
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={handleAppleLogin}
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

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="E-Mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                "Anmelden"
              )}
            </Button>
          </form>

          <div className="text-center text-sm">
            Noch kein Konto?{" "}
            <Link href="/sign-up" className="font-medium underline">
              Hier registrieren
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
