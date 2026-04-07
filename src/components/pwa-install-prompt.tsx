"use client";

import { useEffect, useRef } from "react";
import "@khmyznikov/pwa-install";

export function PWAInstallPrompt() {
  const installRef = useRef<any>(null);

  useEffect(() => {
    const handleShowInstall = () => {
      if (installRef.current) {
        installRef.current.showDialog();
      }
    };
    window.addEventListener("show-pwa-install", handleShowInstall);
    return () => window.removeEventListener("show-pwa-install", handleShowInstall);
  }, []);

  return (
    <pwa-install
      ref={installRef}
      name="ProLx Digital Agency"
      icon="/icon-192x192.png"
      description="Experience ProLx as a high-performance native app on your home screen."
      install-description="Install our app for faster access and a seamless digital experience."
      use-custom={true}
      manifest-url="/manifest.json"
    ></pwa-install>
  );
}
