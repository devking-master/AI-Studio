"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, Sparkles, Zap, Shield, Crown, CreditCard, Loader2, Lock, ArrowRight, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import Link from "next/link";

const tiers = [
  {
    name: "Basic",
    price: "Free",
    description: "Perfect for casual conversations",
    features: ["10 messages per day", "Standard speed", "Community support"],
    icon: Zap,
    popular: false,
  },
  {
    name: "Pro",
    price: "$9",
    description: "More power for daily tasks",
    features: ["Unlimited messages", "Priority access", "Email support", "Pro badge"],
    icon: Sparkles,
    popular: true,
  },
  {
    name: "Pro+",
    price: "$19",
    description: "Advanced features for power users",
    features: ["Faster response times", "Custom AI models", "24/7 Priority support", "Advanced analytics"],
    icon: Shield,
    popular: false,
  },
  {
    name: "Premium",
    price: "$49",
    description: "The ultimate AI experience",
    features: ["Everything in Pro+", "Personal AI assistant", "Early access to features", "Dedicated account manager"],
    icon: Crown,
    popular: false,
  },
];

export default function PricingPage() {
  const router = useRouter();
  const [currentTier, setCurrentTier] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<"form" | "processing" | "success">("form");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setCurrentTier(data.tier || "Basic");
        }
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };
    fetchUser();
  }, []);

  const handleStartCheckout = (tier: any) => {
    if (tier.name === currentTier) {
      toast.info("You are already on this plan!");
      return;
    }
    if (tier.name === "Basic") {
      router.push("/Dashboard");
      return;
    }
    setSelectedPlan(tier);
    setIsCheckoutOpen(true);
    setCheckoutStep("form");
  };

  const processPayment = async () => {
    setCheckoutStep("processing");
    
    // Simulate API call delay
    await new Promise(r => setTimeout(r, 2500));

    try {
      const res = await fetch("/api/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: selectedPlan.name }),
      });

      if (res.ok) {
        setCheckoutStep("success");
        setCurrentTier(selectedPlan.name);
        toast.success(`Welcome to ${selectedPlan.name}!`);
        // Reset form
        setCardNumber("");
        setExpiry("");
        setCvc("");
        
        setTimeout(() => {
          router.push("/Dashboard");
        }, 2000);
      } else {
        const data = await res.json();
        toast.error(data.error || "Payment failed");
        setCheckoutStep("form");
      }
    } catch (err) {
      toast.error("An error occurred during payment.");
      setCheckoutStep("form");
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white py-24 px-4 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20 page-transition">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-purple-400 font-semibold tracking-wider uppercase text-sm mb-4"
          >
            Pricing Plans
          </motion.h2>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl font-bold tracking-tight mb-6"
          >
            Simple, transparent pricing
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 text-xl max-w-2xl mx-auto"
          >
            Choose the perfect plan for your needs. No hidden fees, cancel anytime.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative flex flex-col p-8 rounded-[32px] glass-morphism border ${
                tier.name === currentTier 
                  ? "border-accent bg-accent/5 shadow-2xl shadow-accent/10" 
                  : tier.popular 
                    ? "border-purple-500/50" 
                    : "border-white/10"
              }`}
            >
              {tier.name === currentTier && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] shadow-lg">
                  Active Plan
                </div>
              )}
              {tier.popular && tier.name !== currentTier && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] shadow-lg">
                  Most Popular
                </div>
              )}

              <div className="mb-8">
                <div className={`w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 ${tier.name === currentTier ? 'border-accent/50 bg-accent/10' : ''}`}>
                  <tier.icon className={`w-6 h-6 ${tier.name === currentTier ? 'text-accent' : 'text-white'}`} />
                </div>
                <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                <p className="text-gray-400 text-sm">{tier.description}</p>
              </div>

              <div className="mb-8">
                <span className="text-4xl font-bold">{tier.price}</span>
                {tier.price !== "Free" && <span className="text-gray-500 ml-2">/month</span>}
              </div>

              <div className="flex-1 space-y-4 mb-8">
                {tier.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <div className="mt-1 w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                      <Check className={`w-3 h-3 ${tier.name === currentTier ? 'text-accent' : 'text-white'}`} />
                    </div>
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleStartCheckout(tier)}
                className={`w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${
                  tier.name === currentTier
                    ? "bg-accent/20 text-accent border border-accent/50 cursor-default"
                    : tier.popular
                      ? "bg-white text-black hover:bg-gray-200"
                      : "bg-white/5 text-white border border-white/10 hover:bg-white/10"
                }`}
              >
                {tier.name === currentTier ? (
                  "Current Plan"
                ) : (
                  "Get Started"
                )}
              </motion.button>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 text-center">
          <Link href="/Dashboard" className="text-gray-500 hover:text-white transition-colors">
            ← Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Checkout Modal Simulation */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => checkoutStep !== 'processing' && setIsCheckoutOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-[#121212] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold">Secure Checkout</h3>
                  <button 
                    onClick={() => setIsCheckoutOpen(false)}
                    className="p-2 hover:bg-white/5 rounded-full transition-colors"
                    disabled={checkoutStep === 'processing'}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {checkoutStep === "form" && (
                  <div className="space-y-6">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-400">Selected Plan</span>
                        <span className="text-sm font-bold text-accent">{selectedPlan?.name}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Total Due</span>
                        <span className="text-lg font-bold">{selectedPlan?.price}</span>
                      </div>
                    </div>

                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (cardNumber.length < 15 || expiry.length < 5 || cvc.length < 3) {
                          toast.error("Please enter valid card details");
                          return;
                        }
                        processPayment();
                      }}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Card Details</label>
                        <div className="relative">
                          <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                          <input 
                            type="text"
                            placeholder="0000 0000 0000 0000"
                            maxLength={19}
                            value={cardNumber}
                            onChange={(e) => {
                              let val = e.target.value.replace(/\D/g, "");
                              val = val.replace(/(.{4})/g, "$1 ").trim();
                              setCardNumber(val);
                            }}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-accent outline-none transition-all placeholder:text-gray-600"
                            required
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <input 
                            type="text"
                            placeholder="MM/YY"
                            maxLength={5}
                            value={expiry}
                            onChange={(e) => {
                              let val = e.target.value.replace(/\D/g, "");
                              if (val.length >= 2) {
                                val = val.substring(0, 2) + "/" + val.substring(2, 4);
                              }
                              setExpiry(val);
                            }}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-sm focus:border-accent outline-none transition-all text-center placeholder:text-gray-600"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <input 
                            type="text"
                            placeholder="CVC"
                            maxLength={4}
                            value={cvc}
                            onChange={(e) => setCvc(e.target.value.replace(/\D/g, ""))}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-sm focus:border-accent outline-none transition-all text-center placeholder:text-gray-600"
                            required
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest justify-center py-2 mt-4">
                        <Lock className="w-3 h-3" />
                        SSL Encrypted Payment
                      </div>

                      <button
                        type="submit"
                        className="w-full py-4 bg-white text-black rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-all mt-2"
                      >
                        Pay {selectedPlan?.price} <ArrowRight className="w-4 h-4" />
                      </button>
                    </form>


                  </div>
                )}

                {checkoutStep === "processing" && (
                  <div className="py-12 flex flex-col items-center text-center">
                    <div className="relative mb-8">
                      <div className="absolute inset-0 bg-accent/20 blur-2xl rounded-full" />
                      <Loader2 className="w-16 h-16 text-accent animate-spin relative z-10" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Processing Payment</h3>
                    <p className="text-gray-400 text-sm">Please do not refresh the page...</p>
                  </div>
                )}

                {checkoutStep === "success" && (
                  <div className="py-12 flex flex-col items-center text-center">
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(34,197,94,0.3)]"
                    >
                      <Check className="w-10 h-10 text-white" />
                    </motion.div>
                    <h3 className="text-3xl font-bold mb-2">Payment Success!</h3>
                    <p className="text-gray-400">Your account has been upgraded to <span className="text-white font-bold">{selectedPlan?.name}</span>.</p>
                    <p className="text-gray-500 text-sm mt-4">Redirecting to dashboard...</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
