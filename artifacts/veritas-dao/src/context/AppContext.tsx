import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { usePrivy } from "@privy-io/react-auth";

// ─── Community model ─────────────────────────────────────────────────────────
export interface Community {
  id: string;
  name: string;
  country: string;
  flag: string;
  status: "active" | "coming_soon";
  description: string;
  url: string;
  color: string;
}

export const COMMUNITIES: Community[] = [
  {
    id: "playa-pacifica",
    name: "Playa Pacifica",
    country: "Nicaragua",
    flag: "🇳🇮",
    status: "active",
    description: "Spanish-style beach neighborhood inside Gran Pacifica Beach & Golf Resort. Year-round surf, golf, horseback riding — the closest gated beachfront community to the international airport.",
    url: "https://www.veritasvillages.com/playa-pacifica",
    color: "#2D5A3A",
  },
  {
    id: "coronado",
    name: "Coronado",
    country: "Panama",
    flag: "🇵🇦",
    status: "active",
    description: "Nestled in the hills near Coronado, designed for food security, natural water access, and luxury off-grid living — minutes from beaches, restaurants, and services.",
    url: "https://www.veritasvillages.com/coronado",
    color: "#F7931A",
  },
  {
    id: "chiriqui",
    name: "Chiriquí",
    country: "Panama",
    flag: "🇵🇦",
    status: "active",
    description: "A smaller, more intimate community near Boquete and the Costa Rica border. Perfect for peace, self-sufficiency, and a close-knit neighborhood feel.",
    url: "https://www.veritasvillages.com/chiriqui",
    color: "#2D5A3A",
  },
  {
    id: "atenas",
    name: "Atenas",
    country: "Costa Rica",
    flag: "🇨🇷",
    status: "coming_soon",
    description: "Our newest location in Costa Rica's Central Valley. Currently in early planning — details on site plans, pricing, and availability will be announced as the project progresses.",
    url: "https://www.veritasvillages.com/costa-rica-coming-soon",
    color: "#64B5F6",
  },
];

// ─── Context type ─────────────────────────────────────────────────────────────
interface AppContextValue {
  // Community
  selectedCommunity: Community | null;
  setSelectedCommunity: (c: Community | null) => void;

  // Onboarding
  onboardingComplete: boolean;
  onboardingStep: number;
  setOnboardingStep: (s: number) => void;
  completeOnboarding: () => void;
  showOnboarding: boolean;
  openOnboarding: () => void;
  closeOnboarding: () => void;

  // Derived user info (convenience re-exports from Privy)
  twitterUsername: string | undefined;
  googleEmail: string | undefined;
  userEmail: string | undefined;
  walletAddress: string | undefined;
  isSocialUser: boolean;
  linkedAccountCount: number;
}

const AppContext = createContext<AppContextValue | null>(null);

const LS_ONBOARDING = "vv_onboarding_complete";
const LS_COMMUNITY = "vv_selected_community";

export function AppProvider({ children }: { children: ReactNode }) {
  const { authenticated, user } = usePrivy();

  // ── Community selection ──────────────────────────────────────────────────
  const [selectedCommunity, _setSelectedCommunity] = useState<Community | null>(() => {
    try {
      const saved = localStorage.getItem(LS_COMMUNITY);
      return saved ? COMMUNITIES.find(c => c.id === saved) ?? null : null;
    } catch { return null; }
  });

  const setSelectedCommunity = useCallback((c: Community | null) => {
    _setSelectedCommunity(c);
    try {
      if (c) localStorage.setItem(LS_COMMUNITY, c.id);
      else localStorage.removeItem(LS_COMMUNITY);
    } catch { /* ignore */ }
  }, []);

  // ── Onboarding ───────────────────────────────────────────────────────────
  const [onboardingComplete, setOnboardingComplete] = useState<boolean>(() => {
    try { return localStorage.getItem(LS_ONBOARDING) === "1"; } catch { return false; }
  });
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Show onboarding automatically for newly-authenticated users who haven't completed it
  useEffect(() => {
    if (authenticated && !onboardingComplete) {
      setShowOnboarding(true);
    }
  }, [authenticated, onboardingComplete]);

  const completeOnboarding = useCallback(() => {
    setOnboardingComplete(true);
    setShowOnboarding(false);
    try { localStorage.setItem(LS_ONBOARDING, "1"); } catch { /* ignore */ }
  }, []);

  const openOnboarding = useCallback(() => {
    setOnboardingStep(0);
    setShowOnboarding(true);
  }, []);

  const closeOnboarding = useCallback(() => setShowOnboarding(false), []);

  // ── Derived user info ────────────────────────────────────────────────────
  const twitterUsername = (user as any)?.twitter?.username as string | undefined;
  const googleEmail = (user as any)?.google?.email as string | undefined;
  const userEmail = user?.email?.address;
  const walletAddress = user?.wallet?.address;
  const isSocialUser = !!(twitterUsername || googleEmail || userEmail);

  const linkedAccountCount = [
    twitterUsername, googleEmail, userEmail, walletAddress,
  ].filter(Boolean).length;

  return (
    <AppContext.Provider value={{
      selectedCommunity, setSelectedCommunity,
      onboardingComplete, onboardingStep, setOnboardingStep,
      completeOnboarding, showOnboarding, openOnboarding, closeOnboarding,
      twitterUsername, googleEmail, userEmail, walletAddress,
      isSocialUser, linkedAccountCount,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}
