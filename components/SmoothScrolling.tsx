"use client";

// ─────────────────────────────────────────
// SECTION: SmoothScrolling
// WHAT: Lenis smooth-scroll loop bound to requestAnimationFrame.
// WHY: Webflow-grade inertial scroll site-wide without fighting Next layout.
// PHASE 4: No DB.
// ─────────────────────────────────────────

import { useEffect, useRef } from "react";
import Lenis from "@studio-freight/lenis";

type Props = { children: React.ReactNode };

export default function SmoothScrolling({ children }: Props) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // WHY iOS: Lenis only calls preventDefault on touch when isSmooth is true for that event;
    // isSmooth = (syncTouch && touch) || (smoothWheel && wheel). Keep syncTouch false so
    // touch scrolling stays native; wheel smoothing only (see node_modules @studio-freight/lenis onVirtualScroll).
    const lenis = new Lenis({
      smoothWheel: true,
      syncTouch: false,
      touchMultiplier: 1.15,
      gestureOrientation: "vertical",
    });
    lenisRef.current = lenis;
    // #region agent log
    fetch("http://127.0.0.1:7551/ingest/42fbca1b-95a9-49f3-9134-3f4cc9c8a413", { method: "POST", headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "9e3b5b" }, body: JSON.stringify({ sessionId: "9e3b5b", runId: "baseline", hypothesisId: "H3", location: "components/SmoothScrolling.tsx:29", message: "lenis initialized", data: { hasLenis: Boolean(lenisRef.current), innerHeight: window.innerHeight, clientHeight: document.documentElement.clientHeight, bodyScrollHeight: document.body.scrollHeight, scrollY: window.scrollY }, timestamp: Date.now() }) }).catch(() => { fetch("/api/debug-client-log", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId: "9e3b5b", runId: "baseline", hypothesisId: "H3", location: "components/SmoothScrolling.tsx:29", message: "lenis initialized [relay]", data: { hasLenis: Boolean(lenisRef.current), innerHeight: window.innerHeight, clientHeight: document.documentElement.clientHeight, bodyScrollHeight: document.body.scrollHeight, scrollY: window.scrollY }, timestamp: Date.now() }) }).catch(() => {}); });
    // #endregion

    window.scrollTo(0, 0);
    lenis.scrollTo(0, { immediate: true });

    let rafId = 0;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenisRef.current = null;
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    function handleScrollReset() {
      // #region agent log
      fetch("http://127.0.0.1:7551/ingest/42fbca1b-95a9-49f3-9134-3f4cc9c8a413", { method: "POST", headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "9e3b5b" }, body: JSON.stringify({ sessionId: "9e3b5b", runId: "baseline", hypothesisId: "H3", location: "components/SmoothScrolling.tsx:52", message: "lenis reset event received", data: { hasLenis: Boolean(lenisRef.current), scrollYBeforeLenisReset: window.scrollY }, timestamp: Date.now() }) }).catch(() => { fetch("/api/debug-client-log", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId: "9e3b5b", runId: "baseline", hypothesisId: "H3", location: "components/SmoothScrolling.tsx:52", message: "lenis reset event received [relay]", data: { hasLenis: Boolean(lenisRef.current), scrollYBeforeLenisReset: window.scrollY }, timestamp: Date.now() }) }).catch(() => {}); });
      // #endregion
      lenisRef.current?.scrollTo(0, { immediate: true });
      window.scrollTo(0, 0);
      // #region agent log
      fetch("http://127.0.0.1:7551/ingest/42fbca1b-95a9-49f3-9134-3f4cc9c8a413", { method: "POST", headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "9e3b5b" }, body: JSON.stringify({ sessionId: "9e3b5b", runId: "baseline", hypothesisId: "H3_H4", location: "components/SmoothScrolling.tsx:56", message: "lenis reset applied", data: { hasLenis: Boolean(lenisRef.current), scrollYAfterLenisReset: window.scrollY }, timestamp: Date.now() }) }).catch(() => { fetch("/api/debug-client-log", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId: "9e3b5b", runId: "baseline", hypothesisId: "H3_H4", location: "components/SmoothScrolling.tsx:56", message: "lenis reset applied [relay]", data: { hasLenis: Boolean(lenisRef.current), scrollYAfterLenisReset: window.scrollY }, timestamp: Date.now() }) }).catch(() => {}); });
      // #endregion
    }

    window.addEventListener("app:scroll-to-top", handleScrollReset);
    return () => {
      window.removeEventListener("app:scroll-to-top", handleScrollReset);
    };
  }, []);

  return <>{children}</>;
}
