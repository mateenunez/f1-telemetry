"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { X, Mail, Lock, User } from "lucide-react";

interface AuthFormProps {
  isOpen: boolean;
  onClose: () => void;
  dict: any;
}

export default function AuthForm({ isOpen, onClose, dict }: AuthFormProps) {
  const { login, register, isLoading, error, clearError } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register form state
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!loginEmail || !loginPassword) {
      setFormError(dict.auth.fillAllFields);
      return;
    }

    try {
      await login(loginEmail, loginPassword);
      onClose();
    } catch (err) {
      const code = err instanceof Error ? err.message : "LOGIN_FAILED";
      const errors = dict?.auth?.errors;
      setFormError(
        (errors && (errors[code] ?? errors.default)) || dict.auth.loginFailed
      );
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (
      !registerUsername ||
      !registerEmail ||
      !registerPassword ||
      !registerConfirmPassword
    ) {
      setFormError(dict.auth.fillAllFields);
      return;
    }

    if (registerPassword !== registerConfirmPassword) {
      setFormError(dict.auth.passwordsDoNotMatch);
      return;
    }

    if (registerPassword.length < 8) {
      setFormError(dict.auth.passwordTooShort);
      return;
    }

    try {
      await register(registerUsername, registerEmail, registerPassword);
      onClose();
    } catch (err) {
      const code = err instanceof Error ? err.message : "REGISTRATION_FAILED";
      const errors = dict?.auth?.errors;
      setFormError(
        (errors && (errors[code] ?? errors.default)) ||
          dict.auth.registrationFailed
      );
    }
  };

  const handleClose = () => {
    setFormError(null);
    clearError();
    setLoginEmail("");
    setLoginPassword("");
    setRegisterUsername("");
    setRegisterEmail("");
    setRegisterPassword("");
    setRegisterConfirmPassword("");
    setIsLoginMode(true);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-md bg-black text-white rounded-lg p-8 shadow-2xl"
          style={{
            boxShadow:
              "0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)",
          }}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-200 transition-colors"
          >
            <X width={20} />
          </button>

          {/* Title */}
          <h2 className="text-2xl font-orbitron font-bold mb-6 text-center">
            {isLoginMode ? dict.auth.loginTitle : dict.auth.registerTitle}
          </h2>

          {/* Error Message */}
          {(formError || error) && (
            <div className="mb-4 p-3 rounded-md bg-red-900/30 border border-red-700 text-red-300 text-sm font-geist">
              {formError || error}
            </div>
          )}

          {/* Login Form */}
          {isLoginMode ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Email Input */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-geist font-medium text-gray-200">
                  {dict.auth.email}
                </label>
                <div className="relative">
                  <Mail
                    width={16}
                    className="absolute left-3 top-2 text-gray-500"
                  />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder={dict.auth.emailPlaceholder}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-md bg-warmBlack text-gray-100 border-2 border-gray-700 hover:border-offWhite hover:bg-warmBlack/80 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-f1Blue font-geist"
                    style={{
                      boxShadow:
                        "0 6px 12px -3px #37415140, -3px 0 12px -3px #37415140, 3px 0 12px -3px #37415140",
                    }}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-geist font-medium text-gray-200">
                  {dict.auth.password}
                </label>
                <div className="relative">
                  <Lock
                    width={16}
                    className="absolute left-3 top-2 text-gray-500"
                  />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder={dict.auth.passwordPlaceholder}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-md bg-warmBlack text-gray-100 border-2 border-gray-700 hover:border-offWhite hover:bg-warmBlack/80 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-f1Blue font-geist"
                    style={{
                      boxShadow:
                        "0 6px 12px -3px #37415140, -3px 0 12px -3px #37415140, 3px 0 12px -3px #37415140",
                    }}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-6 px-4 py-2 text-sm rounded-md bg-f1Blue text-white font-geist font-medium transition-all duration-300 hover:bg-f1Blue/80 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-f1Blue"
                style={{
                  boxShadow:
                    "0 6px 12px -3px #37415140, -3px 0 12px -3px #37415140, 3px 0 12px -3px #37415140",
                }}
              >
                {isLoading ? dict.auth.loggingIn : dict.auth.loginButton}
              </button>

              {/* Toggle to Register */}
              <p className="text-center text-sm text-gray-400 font-geist">
                {dict.auth.noAccount}{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsLoginMode(false);
                    setFormError(null);
                  }}
                  className="text-f1Blue hover:text-f1Blue/80 font-medium transition-colors"
                >
                  {dict.auth.signUp}
                </button>
              </p>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {/* Username Input */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-geist font-medium text-gray-200">
                  {dict.auth.username}
                </label>
                <div className="relative">
                  <User
                    width={16}
                    className="absolute left-3 top-3 text-gray-500"
                  />
                  <input
                    type="text"
                    value={registerUsername}
                    onChange={(e) => setRegisterUsername(e.target.value)}
                    placeholder={dict.auth.usernamePlaceholder}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-md bg-warmBlack text-gray-100 border-2 border-gray-700 hover:border-offWhite hover:bg-warmBlack/80 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-f1Blue font-geist"
                    style={{
                      boxShadow:
                        "0 6px 12px -3px #37415140, -3px 0 12px -3px #37415140, 3px 0 12px -3px #37415140",
                    }}
                  />
                </div>
              </div>

              {/* Email Input */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-geist font-medium text-gray-200">
                  {dict.auth.email}
                </label>
                <div className="relative">
                  <Mail
                    width={16}
                    className="absolute left-3 top-3 text-gray-500"
                  />
                  <input
                    type="email"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    placeholder={dict.auth.emailPlaceholder}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-md bg-warmBlack text-gray-100 border-2 border-gray-700 hover:border-offWhite hover:bg-warmBlack/80 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-f1Blue font-geist"
                    style={{
                      boxShadow:
                        "0 6px 12px -3px #37415140, -3px 0 12px -3px #37415140, 3px 0 12px -3px #37415140",
                    }}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-geist font-medium text-gray-200">
                  {dict.auth.password}
                </label>
                <div className="relative">
                  <Lock
                    width={16}
                    className="absolute left-3 top-3 text-gray-500"
                  />
                  <input
                    type="password"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    placeholder={dict.auth.passwordHint}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-md bg-warmBlack text-gray-100 border-2 border-gray-700 hover:border-offWhite hover:bg-warmBlack/80 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-f1Blue font-geist"
                    style={{
                      boxShadow:
                        "0 6px 12px -3px #37415140, -3px 0 12px -3px #37415140, 3px 0 12px -3px #37415140",
                    }}
                  />
                </div>
              </div>

              {/* Confirm Password Input */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-geist font-medium text-gray-200">
                  {dict.auth.confirmPassword}
                </label>
                <div className="relative">
                  <Lock
                    width={16}
                    className="absolute left-3 top-3 text-gray-500"
                  />
                  <input
                    type="password"
                    value={registerConfirmPassword}
                    onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                    placeholder={dict.auth.confirmPasswordPlaceholder}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-md bg-warmBlack text-gray-100 border-2 border-gray-700 hover:border-offWhite hover:bg-warmBlack/80 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-f1Blue font-geist"
                    style={{
                      boxShadow:
                        "0 6px 12px -3px #37415140, -3px 0 12px -3px #37415140, 3px 0 12px -3px #37415140",
                    }}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-6 px-4 py-2 text-sm rounded-md bg-f1Blue text-white font-geist font-medium transition-all duration-300 hover:bg-f1Blue/80 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-f1Blue"
                style={{
                  boxShadow:
                    "0 6px 12px -3px #37415140, -3px 0 12px -3px #37415140, 3px 0 12px -3px #37415140",
                }}
              >
                {isLoading ? dict.auth.registering : dict.auth.registerButton}
              </button>

              {/* Toggle to Login */}
              <p className="text-center text-sm text-gray-400 font-geist">
                {dict.auth.hasAccount}{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsLoginMode(true);
                    setFormError(null);
                  }}
                  className="text-f1Blue hover:text-f1Blue/80 font-medium transition-colors"
                >
                  {dict.auth.logIn}
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
