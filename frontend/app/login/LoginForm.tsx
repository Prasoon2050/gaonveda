"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";

function Icon({ name }: { name: string }) {
  return <span className="material-symbols-outlined">{name}</span>;
}

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    setStatus("");

    const formData = new FormData(event.currentTarget);
    const payload =
      mode === "login"
        ? {
            email: String(formData.get("email") || ""),
            password: String(formData.get("password") || ""),
          }
        : {
            name: String(formData.get("name") || ""),
            email: String(formData.get("email") || ""),
            phone: String(formData.get("phone") || ""),
            password: String(formData.get("password") || ""),
          };

    try {
      const response = await fetch(`/api/auth/${mode === "login" ? "login" : "signup"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Authentication failed");
      }

      setStatus(mode === "login" ? "Signed in successfully." : "Account created successfully.");
      router.push("/profile");
      router.refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Authentication failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-visual" aria-label="Gaon Veda heritage">
        <img src="/hero.png" alt="Gaon Veda traditional pantry ingredients" />
        <div>
          <h1>
            Preserving Heritage,
            <br />
            One Harvest at a Time.
          </h1>
          <p>Experience the purity of traditional Indian farming. Authentic, unrefined, and deeply connected to the soil.</p>
        </div>
      </section>

      <section className="auth-panel" aria-label="Login and signup">
        <div className="auth-card glass-panel" style={{ borderRadius: "16px", padding: "2.5rem" }}>
          <Link className="auth-brand" href="/">
            <img src="/logo.png" alt="" />
            Gaon Veda
          </Link>

          {/* Tab Switcher */}
          <div className="auth-tabs">
            <button
              className={mode === "login" ? "auth-tab active" : "auth-tab"}
              onClick={() => setMode("login")}
              type="button"
            >
              Sign In
            </button>
            <button
              className={mode === "signup" ? "auth-tab active" : "auth-tab"}
              onClick={() => setMode("signup")}
              type="button"
            >
              Create Account
            </button>
          </div>

          {mode === "login" ? (
            <>
              <div className="auth-heading">
                <h2>Welcome Back</h2>
                <span>Log in to continue your journey to natural wellness.</span>
              </div>

              <form className="auth-form" onSubmit={handleSubmit}>
                <label>
                  <span>Email</span>
                  <input name="email" placeholder="prasoon@example.com" type="email" required className="premium-input" />
                </label>
                <label>
                  <span>
                    Password
                    <a href="#">Forgot?</a>
                  </span>
                  <input name="password" placeholder="••••••••" type="password" required className="premium-input" />
                </label>
                <button type="submit" disabled={pending} className="premium-button" style={{ width: "100%", marginTop: "1rem" }}>
                  {pending ? "Signing In..." : "Sign In"} <Icon name="arrow_forward" />
                </button>
                {error ? <p className="auth-error">{error}</p> : null}
                {status ? <p className="auth-success">{status}</p> : null}
              </form>

              <div className="auth-divider">
                <span>Or continue with</span>
              </div>

              <div className="auth-socials">
                <button type="button">
                  <Icon name="mail" /> Google
                </button>
                <button type="button">
                  <Icon name="phone_iphone" /> Apple
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="auth-heading">
                <h2>Join Gaon Veda</h2>
                <span>Create an account to save favorites and track orders.</span>
              </div>

              <form className="auth-form" onSubmit={handleSubmit}>
                <label>
                  <span>Full Name</span>
                  <input name="name" placeholder="Your full name" type="text" required className="premium-input" />
                </label>
                <label>
                  <span>Email</span>
                  <input name="email" placeholder="you@example.com" type="email" required className="premium-input" />
                </label>
                <label>
                  <span>Phone Number</span>
                  <input name="phone" placeholder="+91 98765 43210" type="tel" className="premium-input" />
                </label>
                <label>
                  <span>Password</span>
                  <input name="password" placeholder="Create a password" type="password" minLength={8} required className="premium-input" />
                </label>
                <button type="submit" disabled={pending} className="premium-button" style={{ width: "100%", marginTop: "1rem" }}>
                  {pending ? "Creating..." : "Create Account"} <Icon name="arrow_forward" />
                </button>
                {error ? <p className="auth-error">{error}</p> : null}
                {status ? <p className="auth-success">{status}</p> : null}
              </form>

              <div className="auth-divider">
                <span>Or sign up with</span>
              </div>

              <div className="auth-socials">
                <button type="button">
                  <Icon name="mail" /> Google
                </button>
                <button type="button">
                  <Icon name="phone_iphone" /> Apple
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
