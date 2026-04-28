import { useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useLocation } from "wouter";
import { useApp, COMMUNITIES, type Community } from "@/context/AppContext";
import {
  CheckCircle2, ChevronRight, Globe, KeyRound, LogIn,
  MapPin, ShieldCheck, Wallet, Zap,
} from "lucide-react";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.741l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

// ─── Step Indicator ───────────────────────────────────────────────────────────
function StepDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`rounded-full transition-all duration-300 ${
            i === current
              ? "w-6 h-2 bg-[#F7931A]"
              : i < current
              ? "w-2 h-2 bg-[#2D5A3A]"
              : "w-2 h-2 bg-white/15"
          }`}
        />
      ))}
    </div>
  );
}

// ─── Step 0: Welcome ─────────────────────────────────────────────────────────
function StepWelcome({ onNext }: { onNext: () => void }) {
  const { login } = usePrivy();
  const { authenticated } = usePrivy();
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-center">
        <img src={`${BASE}/veritas-logo.png`} alt="Veritas Villages" className="h-20 w-auto" style={{ filter: "brightness(10) saturate(0.3)" }} />
      </div>

      <div className="text-center space-y-3">
        <h1 className="text-3xl font-bold text-white leading-tight">
          Welcome to <span className="text-[#F7931A]">Veritas Villages</span> DAO
        </h1>
        <p className="text-sm font-mono text-white/50 leading-relaxed max-w-sm mx-auto">
          Sovereignty starts here. Vote on community proposals, manage your residency, and govern alongside your neighbors — all on-chain.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: <ShieldCheck className="h-5 w-5 text-[#2D5A3A]" />, label: "Sovereign governance" },
          { icon: <Globe className="h-5 w-5 text-[#F7931A]" />, label: "4 communities" },
          { icon: <Zap className="h-5 w-5 text-[#2D5A3A]" />, label: "Multichain voting" },
        ].map((item) => (
          <div key={item.label} className="flex flex-col items-center gap-2 p-3 rounded-sm bg-white/4 border border-white/8 text-center">
            {item.icon}
            <span className="text-[9px] font-mono uppercase tracking-widest text-white/40">{item.label}</span>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {authenticated ? (
          <button
            onClick={onNext}
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-sm font-mono text-[12px] uppercase tracking-widest transition-all"
            style={{ background: "linear-gradient(135deg, rgba(45,90,58,0.5), rgba(247,147,26,0.25))", border: "1px solid rgba(247,147,26,0.4)" }}
          >
            <ChevronRight className="h-4 w-4 text-[#F7931A]" />
            <span className="text-[#F7931A]">Continue setup</span>
          </button>
        ) : (
          <>
            <button
              onClick={() => login()}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-sm font-mono text-[12px] uppercase tracking-widest transition-all"
              style={{ background: "linear-gradient(135deg, rgba(45,90,58,0.5), rgba(247,147,26,0.25))", border: "1px solid rgba(247,147,26,0.4)" }}
            >
              <LogIn className="h-4 w-4 text-[#F7931A]" />
              <span className="text-[#F7931A]">Sign in to get started</span>
            </button>
            <div className="flex items-center gap-2">
              <div className="flex-1 border-t border-white/8" />
              <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest">or</span>
              <div className="flex-1 border-t border-white/8" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: <XIcon className="h-4 w-4 text-white" />, label: "X / Twitter" },
                { icon: <GoogleIcon className="h-4 w-4" />, label: "Google" },
                { icon: <Wallet className="h-4 w-4 text-white/60" />, label: "Wallet" },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => login()}
                  className="flex flex-col items-center gap-1.5 px-2 py-3 rounded-sm border border-white/10 bg-white/3 hover:bg-white/6 hover:border-white/20 transition-all"
                >
                  {item.icon}
                  <span className="text-[8px] font-mono text-white/35 uppercase tracking-widest">{item.label}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Step 1: Community selection ─────────────────────────────────────────────
function StepCommunity({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { selectedCommunity, setSelectedCommunity } = useApp();

  const handleSelect = (c: Community) => {
    setSelectedCommunity(c);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-1.5">
        <h2 className="text-xl font-bold text-white">Choose your community</h2>
        <p className="text-[11px] font-mono text-white/40 leading-relaxed">
          Select the Veritas Villages community you belong to or are most interested in. You can change this later.
        </p>
      </div>

      <div className="space-y-2">
        {COMMUNITIES.map((c) => (
          <button
            key={c.id}
            onClick={() => handleSelect(c)}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-sm border transition-all text-left ${
              selectedCommunity?.id === c.id
                ? "border-[#F7931A]/50 bg-[#F7931A]/8"
                : "border-white/8 bg-white/3 hover:border-white/20 hover:bg-white/5"
            }`}
          >
            <span className="text-2xl shrink-0">{c.flag}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-bold text-white">{c.name}</span>
                {c.status === "coming_soon" && (
                  <span className="text-[8px] font-mono uppercase tracking-widest text-white/30 border border-white/15 px-1.5 py-0.5 rounded">
                    Soon
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <MapPin className="h-2.5 w-2.5 text-white/25" />
                <span className="text-[9px] font-mono text-white/30">{c.country}</span>
              </div>
            </div>
            {selectedCommunity?.id === c.id && (
              <CheckCircle2 className="h-4 w-4 text-[#F7931A] shrink-0" />
            )}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <button
          onClick={onBack}
          className="flex-1 px-4 py-3 rounded-sm border border-white/12 bg-white/3 hover:bg-white/6 font-mono text-[11px] uppercase tracking-widest text-white/50 transition-all"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!selectedCommunity}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-sm font-mono text-[11px] uppercase tracking-widest transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: "linear-gradient(135deg, rgba(45,90,58,0.5), rgba(247,147,26,0.25))", border: "1px solid rgba(247,147,26,0.4)" }}
        >
          <span className="text-[#F7931A]">Continue</span>
          <ChevronRight className="h-3.5 w-3.5 text-[#F7931A]" />
        </button>
      </div>
    </div>
  );
}

// ─── Step 2: Identity confirmation ───────────────────────────────────────────
function StepIdentity({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { twitterUsername, googleEmail, userEmail, walletAddress } = useApp();
  const { user } = usePrivy();

  const linkedAccounts = [
    twitterUsername && { icon: <XIcon className="h-3.5 w-3.5 text-white/70" />, label: `@${twitterUsername}`, type: "X / Twitter" },
    googleEmail && { icon: <GoogleIcon className="h-3.5 w-3.5" />, label: googleEmail, type: "Google" },
    userEmail && { icon: <span className="font-mono text-[10px] text-white/60">@</span>, label: userEmail, type: "Email" },
    walletAddress && { icon: <Wallet className="h-3.5 w-3.5 text-[#F7931A]" />, label: `${walletAddress.slice(0, 8)}…${walletAddress.slice(-6)}`, type: "Wallet" },
  ].filter(Boolean);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-1.5">
        <h2 className="text-xl font-bold text-white">Your identity</h2>
        <p className="text-[11px] font-mono text-white/40 leading-relaxed">
          These are the accounts linked to your DAO membership. Your identity is fully self-sovereign — no one can revoke it.
        </p>
      </div>

      <div className="space-y-2">
        {linkedAccounts.length > 0 ? linkedAccounts.map((acct: any) => (
          <div key={acct.type} className="flex items-center gap-3 px-4 py-3 rounded-sm border border-white/8 bg-white/3">
            <span className="shrink-0 w-6 flex items-center justify-center">{acct.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="text-[9px] font-mono uppercase tracking-widest text-white/25 mb-0.5">{acct.type}</div>
              <div className="text-[11px] font-mono text-white/70 truncate">{acct.label}</div>
            </div>
            <CheckCircle2 className="h-3.5 w-3.5 text-green-400/70 shrink-0" />
          </div>
        )) : (
          <div className="text-center py-6 text-[11px] font-mono text-white/30">No linked accounts yet.</div>
        )}
      </div>

      <div className="px-4 py-3 rounded-sm border border-[#2D5A3A]/30 bg-[#2D5A3A]/8">
        <p className="text-[10px] font-mono text-white/40 leading-relaxed">
          You can add more accounts later from your <span className="text-[#F7931A]/70">Profile</span>. Additional linked accounts strengthen your social key recovery options.
        </p>
      </div>

      <div className="flex gap-2">
        <button onClick={onBack} className="flex-1 px-4 py-3 rounded-sm border border-white/12 bg-white/3 hover:bg-white/6 font-mono text-[11px] uppercase tracking-widest text-white/50 transition-all">
          Back
        </button>
        <button
          onClick={onNext}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-sm font-mono text-[11px] uppercase tracking-widest transition-all"
          style={{ background: "linear-gradient(135deg, rgba(45,90,58,0.5), rgba(247,147,26,0.25))", border: "1px solid rgba(247,147,26,0.4)" }}
        >
          <span className="text-[#F7931A]">Continue</span>
          <ChevronRight className="h-3.5 w-3.5 text-[#F7931A]" />
        </button>
      </div>
    </div>
  );
}

// ─── Step 3: Wallet ready ─────────────────────────────────────────────────────
function StepWallet({ onFinish }: { onFinish: () => void }) {
  const { walletAddress, isSocialUser } = useApp();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#2D5A3A] to-[#F7931A] flex items-center justify-center">
          <Wallet className="h-8 w-8 text-white" />
        </div>
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold text-white">Your wallet is ready</h2>
        <p className="text-[11px] font-mono text-white/40 leading-relaxed">
          A non-custodial embedded wallet has been created for you. It's secured by your social login and lives entirely in your control.
        </p>
      </div>

      {walletAddress && (
        <div className="rounded-sm border border-white/10 bg-white/4 px-4 py-3 space-y-1">
          <p className="text-[9px] uppercase tracking-widest font-mono text-white/25">Your wallet address</p>
          <p className="font-mono text-[12px] text-white/70 break-all">{walletAddress}</p>
        </div>
      )}

      <div className="space-y-2">
        {[
          { icon: <ShieldCheck className="h-3.5 w-3.5 text-[#2D5A3A]" />, text: "Non-custodial — only you hold the key" },
          { icon: <Zap className="h-3.5 w-3.5 text-[#F7931A]" />, text: "Works on Celo and Rootstock (RSK)" },
          isSocialUser && { icon: <KeyRound className="h-3.5 w-3.5 text-[#F7931A]" />, text: "Export your private key anytime via Social Key Recovery" },
        ].filter(Boolean).map((item: any) => (
          <div key={item.text} className="flex items-center gap-2.5 px-3 py-2 rounded-sm bg-white/3 border border-white/6">
            {item.icon}
            <span className="text-[10px] font-mono text-white/45">{item.text}</span>
          </div>
        ))}
      </div>

      <button
        onClick={onFinish}
        className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-sm font-mono text-[12px] uppercase tracking-widest transition-all"
        style={{ background: "linear-gradient(135deg, rgba(45,90,58,0.55), rgba(247,147,26,0.28))", border: "1px solid rgba(247,147,26,0.5)" }}
      >
        <CheckCircle2 className="h-4 w-4 text-green-400" />
        <span className="text-[#F7931A]">Enter the DAO</span>
      </button>
    </div>
  );
}

// ─── Onboarding overlay ───────────────────────────────────────────────────────
export function OnboardingOverlay() {
  const { showOnboarding, closeOnboarding, onboardingStep, setOnboardingStep, completeOnboarding } = useApp();
  const { authenticated } = usePrivy();

  useEffect(() => {
    if (showOnboarding) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [showOnboarding]);

  if (!showOnboarding) return null;

  const TOTAL_STEPS = 4;
  const next = () => setOnboardingStep(Math.min(onboardingStep + 1, TOTAL_STEPS - 1));
  const back = () => setOnboardingStep(Math.max(onboardingStep - 1, 0));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)" }}>
      <div className="w-full max-w-md bg-[#0d1a12] border border-white/10 rounded-sm shadow-2xl overflow-hidden">
        {/* Header bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/8 bg-[#2D5A3A]/10">
          <StepDots total={TOTAL_STEPS} current={onboardingStep} />
          <button
            onClick={closeOnboarding}
            className="text-[9px] font-mono uppercase tracking-widest text-white/25 hover:text-white/50 transition-colors"
          >
            Skip setup
          </button>
        </div>

        {/* Step content */}
        <div className="p-6">
          {onboardingStep === 0 && <StepWelcome onNext={() => authenticated ? next() : undefined} />}
          {onboardingStep === 1 && <StepCommunity onNext={next} onBack={back} />}
          {onboardingStep === 2 && <StepIdentity onNext={next} onBack={back} />}
          {onboardingStep === 3 && <StepWallet onFinish={completeOnboarding} />}
        </div>
      </div>
    </div>
  );
}

// ─── Standalone /onboarding page (accessible from nav / deep link) ────────────
export default function OnboardingPage() {
  const [, navigate] = useLocation();
  const { completeOnboarding, onboardingStep, setOnboardingStep, openOnboarding } = useApp();

  useEffect(() => { openOnboarding(); }, []);

  const handleComplete = () => {
    completeOnboarding();
    navigate("/");
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-md bg-white/2 border border-white/8 rounded-sm p-6">
        {onboardingStep === 0 && <StepWelcome onNext={() => setOnboardingStep(1)} />}
        {onboardingStep === 1 && <StepCommunity onNext={() => setOnboardingStep(2)} onBack={() => setOnboardingStep(0)} />}
        {onboardingStep === 2 && <StepIdentity onNext={() => setOnboardingStep(3)} onBack={() => setOnboardingStep(1)} />}
        {onboardingStep === 3 && <StepWallet onFinish={handleComplete} />}
      </div>
    </div>
  );
}
