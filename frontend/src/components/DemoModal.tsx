"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/lib/AppContext";
import {
  X,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  Scale,
  Package,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

interface Step {
  id: number;
  timeRange: string;
  title: string;
  subtitle: string;
  icon: any;
  content: React.ReactNode;
}

export function DemoModal() {
  const { isDemoModalOpen, setIsDemoModalOpen, currencySymbol, currencyRate } = useApp();
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  // Auto-play demo simulation
  useEffect(() => {
    if (!isDemoModalOpen || !isPlaying) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setCurrentStep((curr) => (curr + 1) % 3);
          return 0;
        }
        return prev + 2; // ~5 seconds per step
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isDemoModalOpen, isPlaying]);

  if (!isDemoModalOpen) return null;

  const steps: Step[] = [
    {
      id: 0,
      timeRange: "0:00 - 0:45",
      title: "Step 1: Gram-Precision Ingredient Costing",
      subtitle: "Set supplier package prices; CrumbLedger derives exact gram costs across your formulas.",
      icon: Scale,
      content: (
        <div className="space-y-3 w-full max-w-lg bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 shadow-xl">
          <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-800">
            <span className="font-semibold text-slate-300">Supplier Price Entry</span>
            <span className="text-emerald-400 font-mono text-[11px] bg-emerald-950/80 px-2 py-0.5 rounded">Auto-Calculated</span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-white">Valrhona Dutch Cocoa (1,000g)</span>
              <span className="font-mono text-amber-300 font-semibold">{currencySymbol}{(42 * currencyRate).toFixed(2)} &rarr; {currencySymbol}{(0.042 * currencyRate).toFixed(3)}/g</span>
            </div>
            <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-white">Organic Butter (1,000g)</span>
              <span className="font-mono text-amber-300 font-semibold">{currencySymbol}{(24.5 * currencyRate).toFixed(2)} &rarr; {currencySymbol}{(0.0245 * currencyRate).toFixed(3)}/g</span>
            </div>
            <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-white">Pastry Flour T55 (5,000g)</span>
              <span className="font-mono text-amber-300 font-semibold">{currencySymbol}{(18.0 * currencyRate).toFixed(2)} &rarr; {currencySymbol}{(0.0036 * currencyRate).toFixed(3)}/g</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 text-center pt-1">
            ⚡ Updating butter supplier price automatically updates 14 active cake formulas!
          </div>
        </div>
      ),
    },
    {
      id: 1,
      timeRange: "0:45 - 1:20",
      title: "Step 2: Labor & 70%+ Margin Defense",
      subtitle: "Factor in baker labor hours, electricity, and packaging to protect profit margins.",
      icon: TrendingUp,
      content: (
        <div className="w-full max-w-lg bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 shadow-xl space-y-3">
          <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-800">
            <span className="font-semibold text-slate-300">Unit Cost & Retail Pricing</span>
            <span className="text-amber-400 font-mono text-[11px] bg-amber-950/80 px-2 py-0.5 rounded">Target: 70% Margin</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
              <div className="text-[10px] text-slate-400">Raw Ingredients</div>
              <div className="font-mono text-slate-200 font-bold mt-0.5">{currencySymbol}{(5.92 * currencyRate).toFixed(2)}</div>
            </div>
            <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
              <div className="text-[10px] text-slate-400">Labor & Box</div>
              <div className="font-mono text-slate-200 font-bold mt-0.5">{currencySymbol}{(3.85 * currencyRate).toFixed(2)}</div>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/30 p-2 rounded-xl">
              <div className="text-[10px] text-amber-300 font-semibold">Total Cost/Unit</div>
              <div className="font-mono text-amber-400 font-bold mt-0.5">{currencySymbol}{(9.77 * currencyRate).toFixed(2)}</div>
            </div>
          </div>
          <div className="p-3 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-xl border border-emerald-500/40 text-center">
            <div className="text-[10px] uppercase tracking-wider text-slate-400">Recommended Retail Price</div>
            <div className="text-2xl font-black text-white font-mono mt-0.5">
              {currencySymbol}{(34 * currencyRate).toFixed(2)}
              <span className="text-xs text-emerald-400 font-medium ml-2">(+71.2% Profit Margin)</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 2,
      timeRange: "1:20 - 2:00",
      title: "Step 3: POS Counter Sale & Auto Stock Depletion",
      subtitle: "Ring up orders; raw flour, eggs, and boxes deduct automatically from live pantry.",
      icon: ShoppingBag,
      content: (
        <div className="w-full max-w-lg bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 shadow-xl space-y-3">
          <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-800">
            <span className="font-semibold text-white flex items-center">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-2" />
              Live POS Checkout: Order #ORD-8942
            </span>
            <span className="text-amber-400 font-mono text-[11px] font-bold">Paid via Card</span>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>2x Signature Chocolate Fudge Cake</span>
              <span className="font-mono">{currencySymbol}{(68 * currencyRate).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>12x French Butter Croissant</span>
              <span className="font-mono">{currencySymbol}{(78 * currencyRate).toFixed(2)}</span>
            </div>
            <div className="pt-1 border-t border-slate-800 flex justify-between font-bold text-amber-300">
              <span>Total Revenue Received</span>
              <span className="font-mono">{currencySymbol}{(146 * currencyRate).toFixed(2)}</span>
            </div>
          </div>
          <div className="bg-emerald-950/60 border border-emerald-800 p-2 rounded-xl text-[11px] text-emerald-300 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>Deducted: 700g Cocoa, 1,000g Butter, 1,200g Flour, 2 Cake Boxes</span>
          </div>
        </div>
      ),
    },
  ];

  const currentStepData = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <h3 className="text-sm font-bold text-white tracking-wide">
              CrumbLedger 2-Minute Product Walkthrough
            </h3>
            <span className="hidden sm:inline text-[11px] bg-slate-800 text-amber-300 px-2 py-0.5 rounded font-mono font-semibold">
              Interactive Simulation
            </span>
          </div>
          <button
            onClick={() => setIsDemoModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Simulation Canvas */}
        <div className="relative flex-1 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-6 text-center overflow-y-auto">
          {/* Progress bar across top of canvas */}
          <div className="w-full max-w-lg mb-6">
            <div className="flex justify-between items-center text-xs mb-1.5 text-slate-400">
              <span className="font-semibold text-amber-400">{currentStepData.title}</span>
              <span className="font-mono text-[11px]">{currentStepData.timeRange}</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-400 h-full transition-all duration-100 ease-linear rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Active Step Interactive Screen */}
          <div className="w-full flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-200">
            {currentStepData.content}
            <p className="text-xs text-slate-400 max-w-md mt-4">
              {currentStepData.subtitle}
            </p>
          </div>

          {/* Media Player Control Bar */}
          <div className="mt-6 flex items-center space-x-3 bg-slate-950/90 border border-slate-800 rounded-full px-4 py-2 shadow-lg">
            <button
              onClick={() => {
                setCurrentStep((curr) => (curr - 1 + steps.length) % steps.length);
                setProgress(0);
              }}
              className="p-1 text-slate-400 hover:text-white text-xs font-semibold px-2"
            >
              &larr; Prev
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition"
              title={isPlaying ? "Pause simulation" : "Play simulation"}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current translate-x-0.5" />
              )}
            </button>
            <button
              onClick={() => {
                setProgress(0);
                setCurrentStep(0);
                setIsPlaying(true);
              }}
              className="p-1.5 text-slate-400 hover:text-white rounded-full"
              title="Restart"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setCurrentStep((curr) => (curr + 1) % steps.length);
                setProgress(0);
              }}
              className="p-1 text-slate-400 hover:text-white text-xs font-semibold px-2"
            >
              Next &rarr;
            </button>
          </div>
        </div>

        {/* 3 Step Pill Jumpers */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800/80 grid grid-cols-3 gap-2">
          {steps.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => {
                setCurrentStep(idx);
                setProgress(0);
                setIsPlaying(true);
              }}
              className={`p-2 rounded-xl text-left transition border ${
                currentStep === idx
                  ? "bg-slate-800 border-amber-500/50 text-white"
                  : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              <div className="text-[10px] font-mono text-amber-400">{s.timeRange}</div>
              <div className="text-xs font-semibold truncate">{s.title.split(": ")[1]}</div>
            </button>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-850 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Ready to test the live app with your own recipes?</span>
          </div>
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <button
              onClick={() => setIsDemoModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition"
            >
              Close
            </button>
            <Link
              href="/app"
              onClick={() => setIsDemoModalOpen(false)}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-amber-500/25 hover:from-amber-400 hover:to-amber-500 transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Launch Live App Now</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
