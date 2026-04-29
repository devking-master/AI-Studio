"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  Brain,
  Zap,
  ArrowRight,
  Sparkles,
  Shield,
  Smartphone,
  Globe,
  Menu,
  X
} from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (res.ok) setIsLoggedIn(true);
      } catch (err) {}
    };
    checkAuth();
  }, []);

  return (
    <main className="relative min-h-screen bg-background text-foreground font-sans overflow-hidden transition-colors duration-300">
      {/* Premium Gradient Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 blur-[120px] rounded-full" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 px-4 sm:px-6 md:px-12 py-5 flex items-center justify-between gap-4 backdrop-blur-xl border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-background" />
          </div>
          <span className="text-xl font-bold tracking-tight">AI Studio</span>
        </div>

        <div className="hidden md:flex items-center gap-4 md:gap-8">
          <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</Link>
          <Link href="#security" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Security</Link>
          {isLoggedIn ? (
            <Link
              href="/Dashboard"
              className="px-4 py-2 bg-foreground text-background rounded-full text-sm font-bold hover:opacity-90 transition-all flex items-center gap-2 shadow-lg"
            >
              Enter Studio
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sm font-bold">Sign In</Link>
              <Link
                href="/register"
                className="px-4 py-2 bg-foreground text-background rounded-full text-sm font-bold hover:opacity-90 transition-all"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-3 rounded-2xl bg-foreground/5 hover:bg-foreground/10 transition"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 md:hidden"
            />
            <motion.aside
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-background border-r border-border p-6 md:hidden shadow-2xl overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-foreground flex items-center justify-center shadow-lg">
                    <Sparkles className="w-5 h-5 text-background" />
                  </div>
                  <span className="font-bold text-xl tracking-tight">AI Studio</span>
                </div>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-foreground/5 rounded-xl">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <Link href="#features" onClick={() => setIsMenuOpen(false)} className="block text-base font-semibold text-foreground hover:text-accent transition-colors">Features</Link>
                  <Link href="#security" onClick={() => setIsMenuOpen(false)} className="block text-base font-semibold text-foreground hover:text-accent transition-colors">Security</Link>
                </div>

                <div className="space-y-3">
                  {isLoggedIn ? (
                    <Link
                      href="/Dashboard"
                      onClick={() => setIsMenuOpen(false)}
                      className="block w-full text-center px-4 py-3 bg-foreground text-background rounded-full text-sm font-bold hover:opacity-90 transition-all"
                    >
                      Enter Studio
                    </Link>
                  ) : (
                    <>
                      <Link href="/login" onClick={() => setIsMenuOpen(false)} className="block text-base font-bold text-foreground">Sign In</Link>
                      <Link
                        href="/register"
                        onClick={() => setIsMenuOpen(false)}
                        className="block w-full text-center px-4 py-3 bg-foreground text-background rounded-full text-sm font-bold hover:opacity-90 transition-all"
                      >
                        Get Started
                      </Link>
                    </>
                  )}
                </div>

                <div className="rounded-3xl bg-sidebar p-4 border border-border">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">Preview</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Access AI Studio's secure workflow, performance, and visual preview through one tap.
                  </p>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative pt-36 pb-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8 leading-[1.1]">
              Intelligence, <br />
              <span className="text-muted-foreground opacity-50">redefined.</span>
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
              Experience the next generation of conversational AI. Faster, smarter, and more intuitive than ever before.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-stretch sm:items-center">
              <Link
                href={isLoggedIn ? "/Dashboard" : "/register"}
                className="w-full sm:w-auto px-8 py-5 md:px-10 bg-foreground text-background text-lg font-bold rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-2xl text-center"
              >
                {isLoggedIn ? "Back to Studio" : "Start your journey"}
              </Link>
              <button className="w-full sm:w-auto px-8 py-5 bg-sidebar text-foreground text-lg font-bold rounded-2xl hover:bg-sidebar/80 transition-all border border-border">
                Watch the film
              </button>
            </div>
          </motion.div>

          {/* Product Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="mt-24 relative"
          >
            <div className="relative mx-auto max-w-5xl p-4 bg-sidebar rounded-[40px] border border-border shadow-2xl">
              <div className="grid gap-8 lg:grid-cols-[1.4fr_0.9fr] items-center">
                <div className="relative overflow-hidden rounded-[32px] border border-border shadow-inner bg-black">
                  <video
                    className="w-full h-full min-h-[220px] md:min-h-[320px] object-cover"
                    src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-black/10 p-6">
                    <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground mb-2">AI security demo</p>
                    <h2 className="text-2xl font-bold text-white">Watch the AI protect your workflow.</h2>
                  </div>
                </div>

                <div className="space-y-6 text-left">
                  <div>
                    <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">How it works</p>
                    <h3 className="text-4xl font-black tracking-tight">Real-time intelligence, visualized.</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    The video shows a polished AI experience with security at its core. Every conversation is analyzed, encrypted, and protected while the system keeps responses fast and context-aware.
                  </p>
                  <div className="grid gap-4">
                    <div className="rounded-3xl bg-background p-6 border border-border shadow-sm">
                      <p className="text-sm font-bold">Threat detection</p>
                      <p className="text-sm text-muted-foreground mt-2">AI monitors every query and instantly flags suspicious activity.</p>
                    </div>
                    <div className="rounded-3xl bg-background p-6 border border-border shadow-sm">
                      <p className="text-sm font-bold">Encrypted sessions</p>
                      <p className="text-sm text-muted-foreground mt-2">All data is encrypted end-to-end so your privacy stays intact.</p>
                    </div>
                    <div className="rounded-3xl bg-background p-6 border border-border shadow-sm">
                      <p className="text-sm font-bold">Secure collaboration</p>
                      <p className="text-sm text-muted-foreground mt-2">Share insights confidently with enterprise-grade security baked in.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-4 sm:px-6 bg-sidebar">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { icon: Zap, title: "Pro Performance", desc: "Powered by the world's fastest inference engines for instant replies." },
              { icon: Brain, title: "Neural Logic", desc: "Advanced reasoning capabilities that understand complex nuances." },
              { icon: Shield, title: "Privacy First", desc: "Enterprise-grade encryption keeps your conversations yours alone." },
              { icon: Globe, title: "Global Context", desc: "Supports over 50 languages with native-level fluency." },
              { icon: Smartphone, title: "Anywhere Access", desc: "A seamless experience from your desktop to your smartphone." },
              { icon: Sparkles, title: "Visual Genius", desc: "Upload and analyze images with state-of-the-art vision models." },
            ].map((f, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                className="p-10 bg-background rounded-3xl border border-border shadow-sm hover:shadow-xl transition-all"
              >
                <div className="w-12 h-12 bg-sidebar rounded-2xl flex items-center justify-center mb-6">
                  <f.icon className="w-6 h-6 text-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-4 sm:px-6 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-foreground rounded flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-background" />
            </div>
            <span className="font-bold">AI Studio</span>
          </div>
          <p className="text-sm text-muted-foreground font-medium">© 2024 AI Studio. Designed for the future.</p>
          <div className="flex gap-8">
            <Link href="#" className="text-sm font-bold text-muted-foreground hover:text-foreground">Privacy</Link>
            <Link href="#" className="text-sm font-bold text-muted-foreground hover:text-foreground">Terms</Link>
            <Link href="#" className="text-sm font-bold text-muted-foreground hover:text-foreground">Contact</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
