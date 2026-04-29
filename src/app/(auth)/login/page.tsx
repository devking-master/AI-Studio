"use client";
 
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, Sparkles } from "lucide-react";
import { toast } from "sonner";

function Loader2({ className }: { className?: string }) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className={className}
    >
      <Sparkles className="w-full h-full" />
    </motion.div>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (res.ok) {
          window.location.href = "/Dashboard";
        }
      } catch (err) {
      } catch (err) {}
    };
    checkAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Welcome back!", {
          description: "Redirecting to your dashboard...",
        });
        setTimeout(() => {
          window.location.href = "/Dashboard";
        }, 500);
      } else {
        toast.error(data.error || "Login failed", {
          description: "Please check your credentials and try again.",
        });
      }
    } catch (err) {
      toast.error("Something went wrong", {
        description: "Please check your connection and try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4 overflow-hidden relative transition-colors duration-300">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent/5 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/5 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: "1s" }} />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-foreground text-background mb-8 shadow-2xl"
          >
            <Sparkles className="w-8 h-8" />
          </motion.div>
          <h1 className="text-4xl font-black tracking-tight mb-2">AI Studio</h1>
          <p className="text-muted-foreground font-medium">Continue to your creative space</p>
        </div>

        <div className="bg-card/50 backdrop-blur-xl rounded-[32px] p-10 border border-border shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Email</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-background border border-border rounded-2xl pl-12 pr-6 py-4 outline-none focus:ring-4 focus:ring-accent/5 focus:border-accent/50 transition-all placeholder:text-muted-foreground/50"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-background border border-border rounded-2xl pl-12 pr-6 py-4 outline-none focus:ring-4 focus:ring-accent/5 focus:border-accent/50 transition-all placeholder:text-muted-foreground/50"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-foreground text-background font-bold h-14 rounded-2xl hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 group shadow-xl"
            >
              {loading ? (
                <Loader2 className="w-5 h-5" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground font-medium">
              Don't have an account?{" "}
              <Link href="/register" className="text-foreground font-bold hover:underline decoration-accent underline-offset-4">Create one</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
