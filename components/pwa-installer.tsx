"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaInstaller() {
  const [installEvt, setInstallEvt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.warn("[LOWDOC] SW registration failed:", err);
      });
    }

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstallEvt(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setInstallEvt(null);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!installEvt) return null;

  return (
    <button
      type="button"
      onClick={async () => {
        await installEvt.prompt();
        await installEvt.userChoice;
        setInstallEvt(null);
      }}
      className="fixed bottom-4 right-4 z-50 flex items-center gap-2 border border-line bg-safety px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest text-white shadow-crisp-orange hover:bg-[#ff6a22]"
    >
      <Download size={14} strokeWidth={2.5} />
      Install App
    </button>
  );
}
