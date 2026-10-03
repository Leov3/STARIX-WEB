"use client";

import Image from "next/image";
import { motion, useReducedMotion, useTransform, type MotionValue } from "motion/react";

const signals = [
  ["signal-one", "9%", "22%"],
  ["signal-two", "78%", "17%"],
  ["signal-three", "84%", "71%"],
  ["signal-four", "22%", "82%"],
  ["signal-five", "60%", "38%"],
];

export default function ManifestoSystem({ progress }: { progress: MotionValue<number> }) {
  const prefersReducedMotion = useReducedMotion();
  const farY = useTransform(progress, [0, 1], prefersReducedMotion ? [0, 0] : [18, -18]);
  const routesY = useTransform(progress, [0, 1], prefersReducedMotion ? [0, 0] : [48, -54]);
  const signalY = useTransform(progress, [0, 1], prefersReducedMotion ? [0, 0] : [84, -86]);
  const markOpacity = useTransform(progress, [0, 0.4, 0.72, 0.84, 1], prefersReducedMotion ? [1, 1, 1, 1, 1] : [1, 1, 0.88, 0, 0]);
  const markScale = useTransform(progress, [0, 0.4, 0.72, 0.84], prefersReducedMotion ? [1, 1, 1, 1] : [1, 1.12, 3.5, 12]);

  return (
    <div className="manifesto-system" aria-hidden="true">
      <motion.div className="manifesto-system-grid" style={{ y: farY }} />
      <motion.div className="manifesto-system-haze" style={{ y: farY }} />
        <motion.svg className="manifesto-system-routes" viewBox="0 0 1600 900" fill="none" preserveAspectRatio="xMidYMid slice" style={{ y: routesY }}>
        <path className="manifesto-route manifesto-route-gold" d="M-90 666C248 546 350 812 621 640C884 472 873 189 1155 279C1357 344 1425 202 1705 81" />
        <path className="manifesto-route manifesto-route-gold manifesto-route-secondary" d="M-84 185C192 278 303 154 571 298C824 434 982 722 1268 566C1453 464 1512 556 1682 640" />
        <path className="manifesto-route manifesto-route-muted" d="M110 90C424 282 555 93 796 251C1018 396 1183 182 1516 279" />
        <path className="manifesto-route manifesto-route-muted" d="M48 762C316 669 446 577 701 697C1000 840 1176 638 1538 808" />
      </motion.svg>
      <div className="manifesto-system-mark-anchor">
        <motion.div className="manifesto-system-mark" style={{ opacity: markOpacity, scale: markScale }}>
          <Image src="/brand/starix-mark.png" alt="" width={294} height={295} sizes="180px" />
        </motion.div>
      </div>
      {signals.map(([className, left, top]) => (
        <motion.span
          key={className}
          className={`manifesto-signal ${className}`}
          style={{ left, top, y: signalY }}
          animate={prefersReducedMotion ? undefined : { opacity: [0.28, 1, 0.28], scale: [1, 1.45, 1] }}
          transition={{ duration: 3.8, delay: Number.parseFloat(top) / 20, ease: "easeInOut", repeat: Infinity }}
        />
      ))}
    </div>
  );
}
