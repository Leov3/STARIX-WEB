"use client";

import { AnimatePresence, motion } from "motion/react";
import { usePathname, useRouter } from "next/navigation";
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import Navbar from "@/app/components/navbar";

type RouteDirection = "forward" | "backward";
type CurtainVariant = "solar" | "constellation" | "rings" | "signal" | "eclipse";
type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => { finished: Promise<void> };
};
type RouteTransitionContextValue = {
  goToCapability: (slug: string) => void;
  returnToCapabilities: () => void;
};

const RouteTransitionContext = createContext<RouteTransitionContextValue | null>(null);
const curtainVariants: CurtainVariant[] = ["solar", "constellation", "rings", "signal", "eclipse"];

function CurtainVisual({ variant }: { variant: CurtainVariant }) {
  if (variant === "constellation") {
    return <div className="route-curtain-constellation">
      <span className="constellation-line constellation-line-one" />
      <span className="constellation-line constellation-line-two" />
      <span className="constellation-line constellation-line-three" />
      <i className="constellation-node constellation-node-one" />
      <i className="constellation-node constellation-node-two" />
      <i className="constellation-node constellation-node-three" />
      <i className="constellation-node constellation-node-four" />
      <span className="constellation-star" />
    </div>;
  }

  if (variant === "rings") {
    return <div className="route-curtain-rings">
      <span className="rings-core" />
      <span className="rings-orbit rings-orbit-one" />
      <span className="rings-orbit rings-orbit-two" />
      <span className="rings-orbit rings-orbit-three" />
    </div>;
  }

  if (variant === "signal") {
    return <div className="route-curtain-signal">
      <span className="signal-beam" />
      <i className="signal-node signal-node-one" />
      <i className="signal-node signal-node-two" />
      <i className="signal-node signal-node-three" />
      <span className="signal-star" />
    </div>;
  }

  if (variant === "eclipse") {
    return <div className="route-curtain-eclipse">
      <span className="eclipse-halo" />
      <span className="eclipse-disc" />
      <span className="eclipse-star" />
    </div>;
  }

  return <div className="route-curtain-solar">
    <span className="route-curtain-star" />
    <span className="route-curtain-orbit route-curtain-orbit-one"><i /></span>
    <span className="route-curtain-orbit route-curtain-orbit-two"><i /></span>
    <span className="route-curtain-orbit route-curtain-orbit-three"><i /></span>
  </div>;
}

function useReducedMotionPreference() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return reduced;
}

export function useRouteTransition() {
  const context = useContext(RouteTransitionContext);
  if (!context) throw new Error("useRouteTransition must be used within AppShell");
  return context;
}

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const reducedMotion = useReducedMotionPreference();
  const [isNavigating, setIsNavigating] = useState(false);
  const [curtainPhase, setCurtainPhase] = useState<"covering" | "revealing" | null>(null);
  const [curtainDirection, setCurtainDirection] = useState<RouteDirection>("forward");
  const [curtainVariant, setCurtainVariant] = useState<CurtainVariant>("solar");
  const shouldRestoreServices = useRef(false);
  const destinationPath = useRef<string | null>(null);
  const curtainVariantIndex = useRef(0);

  // Motion enhancements can take a moment to hydrate through a public tunnel.
  // Until that happens, CSS keeps every section in its readable final state.
  useEffect(() => {
    document.documentElement.classList.add("motion-ready");
  }, []);

  const navigate = useCallback((href: string, direction: RouteDirection) => {
    if (isNavigating) return;

    const update = () => router.push(href);
    const documentWithTransition = document as ViewTransitionDocument;

    if (reducedMotion || !documentWithTransition.startViewTransition) {
      update();
      return;
    }

    document.documentElement.dataset.routeTransition = direction;
    setIsNavigating(true);
    destinationPath.current = href.split("#")[0] || "/";
    setCurtainDirection(direction);
    setCurtainVariant(curtainVariants[curtainVariantIndex.current]);
    curtainVariantIndex.current = (curtainVariantIndex.current + 1) % curtainVariants.length;
    setCurtainPhase("covering");
    window.setTimeout(() => {
      const transition = documentWithTransition.startViewTransition(update);
      transition.finished.finally(() => delete document.documentElement.dataset.routeTransition);
    }, 580);
  }, [isNavigating, reducedMotion, router]);

  const goToCapability = useCallback((slug: string) => {
    sessionStorage.setItem("starix-capabilities-scroll", String(window.scrollY));
    navigate(`/capacidades/${slug}`, "forward");
  }, [navigate]);

  const returnToCapabilities = useCallback(() => {
    shouldRestoreServices.current = true;
    navigate("/#servicios", "backward");
  }, [navigate]);

  useEffect(() => {
    if (!destinationPath.current || pathname !== destinationPath.current) return;

    let cancelled = false;
    const revealWhenReady = async () => {
      await document.fonts?.ready;
      const visibleImages = Array.from(document.images).filter((image) => {
        const bounds = image.getBoundingClientRect();
        return image.loading !== "lazy" || (bounds.top < window.innerHeight && bounds.bottom > 0);
      });
      await new Promise<void>((resolve) => {
        const fallback = window.setTimeout(resolve, 1200);
        Promise.all(visibleImages.map((image) => {
          if (image.complete) return Promise.resolve();
          return new Promise<void>((imageReady) => {
            image.addEventListener("load", () => imageReady(), { once: true });
            image.addEventListener("error", () => imageReady(), { once: true });
          });
        })).then(() => {
          window.clearTimeout(fallback);
          resolve();
        });
      });
      window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
        if (cancelled) return;
        if (pathname === "/" && shouldRestoreServices.current) {
          shouldRestoreServices.current = false;
          const savedScroll = Number(sessionStorage.getItem("starix-capabilities-scroll"));
          const services = document.getElementById("servicios");
          window.scrollTo({
            top: Number.isFinite(savedScroll) && savedScroll > 0 ? savedScroll : (services?.offsetTop ?? 0),
            behavior: "auto",
          });
        }
        window.setTimeout(() => setCurtainPhase("revealing"), 600);
        window.setTimeout(() => {
          setCurtainPhase(null);
          setIsNavigating(false);
          destinationPath.current = null;
        }, 1200);
      }));
    };

    void revealWhenReady();
    return () => { cancelled = true; };
  }, [pathname]);

  const value = useMemo(() => ({ goToCapability, returnToCapabilities }), [goToCapability, returnToCapabilities]);

  return (
    <RouteTransitionContext.Provider value={value}>
      <Navbar />
      <div className="route-stage">{children}</div>
      <AnimatePresence>
        {curtainPhase && (
          <motion.div
            className="route-curtain"
            initial={curtainPhase === "covering" ? { x: curtainDirection === "forward" ? "110%" : "-110%" } : { x: 0 }}
            animate={curtainPhase === "covering" ? { x: 0 } : { x: curtainDirection === "forward" ? "-110%" : "110%" }}
            exit={{ opacity: 0 }}
            transition={{ duration: .56, ease: [0.76, 0, 0.24, 1] }}
            aria-hidden="true"
          >
            <CurtainVisual variant={curtainVariant} />
          </motion.div>
        )}
      </AnimatePresence>
    </RouteTransitionContext.Provider>
  );
}
