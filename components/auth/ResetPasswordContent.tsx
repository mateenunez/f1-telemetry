"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock } from "lucide-react";
import { userEndpoints } from "@/utils/user";

interface ResetPasswordContentProps {
  dict: any;
  lang: string;
}

export default function ResetPasswordContent({
  dict,
  lang,
}: ResetPasswordContentProps) {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError(dict.auth.errors.INVALID_OR_EXPIRED_TOKEN);
      return;
    }
    if (!password || !confirmPassword) {
      setError(dict.auth.fillAllFields);
      return;
    }
    if (password !== confirmPassword) {
      setError(dict.auth.passwordsDoNotMatch);
      return;
    }
    if (password.length < 8) {
      setError(dict.auth.passwordTooShort);
      return;
    }

    setIsLoading(true);
    try {
      await userEndpoints.resetPassword(token, password);
      setSuccess(true);
    } catch (err) {
      const code =
        err instanceof Error ? err.message : "RESET_PASSWORD_FAILED";
      const errors = dict?.auth?.errors;
      setError(
        (errors && (errors[code] ?? errors.default)) ||
          dict.auth.errors.RESET_PASSWORD_FAILED,
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="relative w-full max-w-md bg-black text-white rounded-lg p-8 shadow-2xl"
      style={{
        boxShadow:
          "0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)",
      }}
    >
      <h2 className="text-2xl font-orbitron font-normal mb-6 text-center">
        {dict.auth.resetPasswordTitle}
      </h2>

      {success ? (
        <div className="text-center space-y-4">
          <p className="text-sm text-gray-300 font-geist">
            {dict.auth.resetPasswordSuccessDescription}
          </p>
          <Link
            href={`/${lang}`}
            className="inline-block text-f1Blue hover:text-f1Blue/80 font-medium transition-colors font-geist text-sm"
          >
            {dict.auth.goToLogin}
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-md bg-red-900/30 border border-red-700 text-red-300 text-sm font-geist">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-sm font-geist font-medium text-offWhite">
              {dict.auth.password}
            </label>
            <div className="relative">
              <Lock
                width={16}
                className="absolute left-3 top-2 text-gray-400"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={dict.auth.passwordHint}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-md bg-warmBlack text-white border-2 border-gray-700 hover:border-offWhite hover:bg-warmBlack/80 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-f1Blue font-geist"
                style={{
                  boxShadow:
                    "0 6px 12px -3px #37415140, -3px 0 12px -3px #37415140, 3px 0 12px -3px #37415140",
                }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-geist font-medium text-offWhite">
              {dict.auth.confirmPassword}
            </label>
            <div className="relative">
              <Lock
                width={16}
                className="absolute left-3 top-2 text-gray-400"
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={dict.auth.confirmPasswordPlaceholder}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-md bg-warmBlack text-white border-2 border-gray-700 hover:border-offWhite hover:bg-warmBlack/80 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-f1Blue font-geist"
                style={{
                  boxShadow:
                    "0 6px 12px -3px #37415140, -3px 0 12px -3px #37415140, 3px 0 12px -3px #37415140",
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !token}
            className="w-full mt-6 px-4 py-2 text-sm rounded-md bg-f1Blue text-white font-geist font-medium transition-all duration-300 hover:bg-f1Blue/80 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-f1Blue"
            style={{
              boxShadow:
                "0 6px 12px -3px #37415140, -3px 0 12px -3px #37415140, 3px 0 12px -3px #37415140",
            }}
          >
            {isLoading ? dict.auth.resettingPassword : dict.auth.resetPasswordButton}
          </button>
        </form>
      )}
    </div>
  );
}
