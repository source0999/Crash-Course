"use client";

// ─────────────────────────────────────────
// SECTION: RouteChangeScrollToTop
// WHAT: Resets native + Lenis scroll state whenever pathname changes.
// WHY: App Router transitions can preserve scroll offset unless explicitly normalized.
// PHASE 4: No changes needed.
// ─────────────────────────────────────────

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function RouteChangeScrollToTop() {
  const pathname = usePathname();
  const isRouteSettlingRef = useRef(false);
  const lastVisualViewportHeightRef = useRef<number | null>(null);
  const settleClampRafRef = useRef<number | null>(null);
  const routeRunRef = useRef(0);

  function logDebug(payload: {
    runId: string;
    hypothesisId: string;
    location: string;
    message: string;
    data: Record<string, unknown>;
  }) {
    const body = JSON.stringify({
      sessionId: "9e3b5b",
      ...payload,
      timestamp: Date.now(),
    });

    fetch("http://127.0.0.1:7551/ingest/42fbca1b-95a9-49f3-9134-3f4cc9c8a413", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "9e3b5b" },
      body,
    }).catch(() => {
      fetch("/api/debug-client-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      }).catch(() => {});
    });
  }

  useEffect(() => {
    routeRunRef.current += 1;
    const run = routeRunRef.current;
    isRouteSettlingRef.current = pathname === "/";
    lastVisualViewportHeightRef.current = window.visualViewport?.height ?? null;

    // #region agent log
    logDebug({
      runId: "post-fix-2",
      hypothesisId: "H1_H2_H3_H5_H6",
      location: "components/RouteChangeScrollToTop.tsx:47",
      message: "route-change effect start",
      data: {
        pathname,
        scrollY: window.scrollY,
        innerHeight: window.innerHeight,
        clientHeight: document.documentElement.clientHeight,
        visualViewportHeight: window.visualViewport?.height ?? null,
      },
    });
    // #endregion

    window.scrollTo(0, 0);
    window.dispatchEvent(new Event("app:scroll-to-top"));

    if (pathname === "/") {
      let clampFrames = 0;
      function clampWhileSettling() {
        if (routeRunRef.current !== run) return;
        clampFrames += 1;

        if (isRouteSettlingRef.current && window.scrollY !== 0) {
          const driftedScrollY = window.scrollY;
          window.scrollTo(0, 0);
          window.dispatchEvent(new Event("app:scroll-to-top"));
          // #region agent log
          logDebug({
            runId: "post-fix-11",
            hypothesisId: "H10",
            location: "components/RouteChangeScrollToTop.tsx:78",
            message: "frame clamp corrected non-resize drift",
            data: {
              pathname,
              clampFrame: clampFrames,
              correctedFromScrollY: driftedScrollY,
              correctedToScrollY: window.scrollY,
            },
          });
          // #endregion
        }

        if (isRouteSettlingRef.current && clampFrames < 60) {
          settleClampRafRef.current = requestAnimationFrame(clampWhileSettling);
        }
      }
      settleClampRafRef.current = requestAnimationFrame(clampWhileSettling);
    }

    // #region agent log
    logDebug({
      runId: "post-fix-2",
      hypothesisId: "H3_H4",
      location: "components/RouteChangeScrollToTop.tsx:64",
      message: "route-change reset fired",
      data: {
        pathname,
        scrollYAfterNativeReset: window.scrollY,
        innerHeight: window.innerHeight,
        visualViewportHeight: window.visualViewport?.height ?? null,
      },
    });
    // #endregion

    function stopSettling(reason: "touchmove" | "wheel" | "keydown") {
      if (routeRunRef.current !== run) return;
      if (!isRouteSettlingRef.current) return;
      isRouteSettlingRef.current = false;
      // #region agent log
      logDebug({
        runId: "post-fix-11",
        hypothesisId: "H6",
        location: "components/RouteChangeScrollToTop.tsx:82",
        message: "route settling finished by interaction",
        data: { pathname, reason, scrollY: window.scrollY },
      });
      // #endregion
    }

    const onTouchMove = () => {
      if (window.scrollY > 120) stopSettling("touchmove");
    };
    const onWheel = () => stopSettling("wheel");
    const onKeyDown = () => stopSettling("keydown");

    if (pathname === "/") {
      window.addEventListener("touchmove", onTouchMove, { passive: true });
      window.addEventListener("wheel", onWheel, { passive: true });
      window.addEventListener("keydown", onKeyDown);
    }

    return () => {
      routeRunRef.current += 1;
      if (settleClampRafRef.current) cancelAnimationFrame(settleClampRafRef.current);
      if (pathname === "/") {
        window.removeEventListener("touchmove", onTouchMove);
        window.removeEventListener("wheel", onWheel);
        window.removeEventListener("keydown", onKeyDown);
      }
      isRouteSettlingRef.current = false;
    };
  }, [pathname]);

  useEffect(() => {
    if (pathname !== "/") return;

    let frame = 0;
    let maxScrollY = window.scrollY;
    let minScrollY = window.scrollY;
    let rafId = 0;

    function sample() {
      frame += 1;
      maxScrollY = Math.max(maxScrollY, window.scrollY);
      minScrollY = Math.min(minScrollY, window.scrollY);

      if (frame >= 45) {
        // #region agent log
        logDebug({
          runId: "post-fix-8",
          hypothesisId: "H9",
          location: "components/RouteChangeScrollToTop.tsx:147",
          message: "home route post-nav scroll profile",
          data: {
            frameCount: frame,
            minScrollY,
            maxScrollY,
            finalScrollY: window.scrollY,
            innerHeight: window.innerHeight,
            visualViewportHeight: window.visualViewport?.height ?? null,
          },
        });
        // #endregion
        return;
      }

      rafId = requestAnimationFrame(sample);
    }

    rafId = requestAnimationFrame(sample);
    return () => cancelAnimationFrame(rafId);
  }, [pathname]);

  useEffect(() => {
    const run = routeRunRef.current;
    function handleViewportChange() {
      if (routeRunRef.current !== run) return;
      // #region agent log
      logDebug({
        runId: "post-fix-11",
        hypothesisId: "H2_H6",
        location: "components/RouteChangeScrollToTop.tsx:113",
        message: "viewport changed",
        data: {
          pathname,
          eventType: "visualViewport.resize",
          innerHeight: window.innerHeight,
          clientHeight: document.documentElement.clientHeight,
          visualViewportHeight: window.visualViewport?.height ?? null,
          lastVisualViewportHeight: lastVisualViewportHeightRef.current,
          scrollY: window.scrollY,
          isRouteSettling: isRouteSettlingRef.current,
        },
      });
      // #endregion

      if (pathname === "/" && isRouteSettlingRef.current && window.scrollY !== 0) {
        const previousScrollY = window.scrollY;
        window.scrollTo(0, 0);
        window.dispatchEvent(new Event("app:scroll-to-top"));
        // #region agent log
        logDebug({
          runId: "post-fix-11",
          hypothesisId: "H6",
          location: "components/RouteChangeScrollToTop.tsx:133",
          message: "applied resize correction while settling",
          data: {
            pathname,
            correctedFromScrollY: previousScrollY,
            correctedToScrollY: window.scrollY,
            visualViewportHeight: window.visualViewport?.height ?? null,
          },
        });
        // #endregion
      }

      lastVisualViewportHeightRef.current = window.visualViewport?.height ?? null;
    }

    window.visualViewport?.addEventListener("resize", handleViewportChange);
    return () => {
      window.visualViewport?.removeEventListener("resize", handleViewportChange);
    };
  }, [pathname]);

  return null;
}
