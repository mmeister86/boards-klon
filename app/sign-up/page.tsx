"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { FaApple } from "react-icons/fa";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
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

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error: signUpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) {
        setError(signUpError.message);
      } else {
        setSuccess(
          "Magic Link wurde gesendet! Bitte überprüfen Sie Ihre E-Mails zur Bestätigung der Registrierung."
        );
        setEmail("");
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
      const { error: googleError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (googleError) setError(googleError.message);
    } catch (error) {
      console.error("Google signup error:", error);
      setError("Ein Fehler ist bei der Registrierung mit Google aufgetreten");
    }
  };

  const handleAppleSignUp = async () => {
    try {
      const { error: appleError } = await supabase.auth.signInWithOAuth({
        provider: "apple",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (appleError) setError(appleError.message);
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
      ></div>

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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24"
                viewBox="0 0 24 24"
                width="24"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
                <path d="M1 1h22v22H1z" fill="none" />
              </svg>
              Mit Google
            </Button>
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={handleAppleSignUp}
              disabled={isLoading}
            >
              <FaApple size={20} />
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

          <form onSubmit={handleEmailSignUp} className="space-y-4">
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
                "Registrieren"
              )}
            </Button>
          </form>

          <div className="text-center text-sm">
            Bereits ein Konto?{" "}
            <Link href="/sign-in" className="font-medium underline">
              Hier anmelden
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
