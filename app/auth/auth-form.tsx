"use client";

import type React from "react";

import { useState } from "react";
import { signIn, signUp } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFormState } from "react-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

const initialState = {
  error: null,
  success: null,
};

export default function AuthForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");

  // Form states
  const [signInState, signInAction] = useFormState(signIn, initialState);
  const [signUpState, signUpAction] = useFormState(signUp, initialState);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsLoading(true);
    // Form submission is handled by the form action
    const formData = new FormData(e.currentTarget);
    const emailValue = formData.get("email") as string;
    setEmail(emailValue);
  };

  // Reset loading state after form submission
  if (
    (signInState?.error ||
      signInState?.success ||
      signUpState?.error ||
      signUpState?.success) &&
    isLoading
  ) {
    setIsLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-center space-x-4">
        <Button
          variant={isSignUp ? "outline" : "default"}
          onClick={() => setIsSignUp(false)}
          type="button"
        >
          Anmelden
        </Button>
        <Button
          variant={isSignUp ? "default" : "outline"}
          onClick={() => setIsSignUp(true)}
          type="button"
        >
          Registrieren
        </Button>
      </div>

      {/* Show alerts for errors and success */}
      {signInState?.error && !isSignUp && (
        <Alert variant="destructive">
          <AlertDescription>{signInState.error}</AlertDescription>
        </Alert>
      )}

      {signUpState?.error && isSignUp && (
        <Alert variant="destructive">
          <AlertDescription>{signUpState.error}</AlertDescription>
        </Alert>
      )}

      {signInState?.success && !isSignUp && (
        <Alert>
          <AlertDescription>{signInState.success}</AlertDescription>
        </Alert>
      )}

      {signUpState?.success && isSignUp && (
        <Alert>
          <AlertDescription>{signUpState.success}</AlertDescription>
        </Alert>
      )}

      {/* Email Form */}
      <form
        action={isSignUp ? signUpAction : signInAction}
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <div className="space-y-2">
          <Label htmlFor="email">E-Mail</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            placeholder="ihre@email.de"
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Magic Link wird gesendet...
            </>
          ) : (
            `Magic Link senden${
              isSignUp ? " zum Registrieren" : " zum Anmelden"
            }`
          )}
        </Button>
        <p className="text-xs text-center text-muted-foreground mt-4">
          Wir senden Ihnen einen Magic Link zum{" "}
          {isSignUp ? "Erstellen Ihres Kontos" : "Anmelden"}
        </p>
      </form>
    </div>
  );
}
