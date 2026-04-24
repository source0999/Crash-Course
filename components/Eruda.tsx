"use client";

import { useEffect } from "react";

export default function Eruda() {
  useEffect(() => {
    const w = window as typeof window & { eruda?: { init: () => void } };
    if (w.eruda) {
      w.eruda.init();
      return;
    }
    if (document.querySelector("script[data-eruda-loader]")) return;

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/eruda";
    script.async = true;
    script.dataset.erudaLoader = "";
    script.onload = () => {
      w.eruda?.init();
    };
    document.body.appendChild(script);
  }, []);

  return null;
}
