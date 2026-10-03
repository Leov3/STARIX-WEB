"use client";

import lottie from "lottie-web";
import { useReducedMotion } from "motion/react";
import Image from "next/image";
import { useEffect, useMemo, useRef } from "react";

const illustrations = {
  data: { file: "data-team.png", signal: [1175, 584] },
  repetition: { file: "manual-work.png", signal: [1140, 348] },
  leads: { file: "lost-leads.png", signal: [840, 518] },
  systems: { file: "systems.png", signal: [778, 412] },
  web: { file: "web.png", signal: [905, 360] },
} as const;

export type FrictionIllustration = keyof typeof illustrations;

const gold = [0.79, 0.64, 0.29, 1];

function keyframes(points: readonly number[][]) {
  return points.map((point, index) => (
    index === points.length - 1
      ? { t: index * 72, s: point }
      : { t: index * 72, s: point, e: points[index + 1] }
  ));
}

function movingCard(ind: number, name: string, points: readonly number[][], delay = 0) {
  return {
    ddd: 0,
    ind,
    ty: 4,
    nm: name,
    sr: 1,
    ks: {
      o: { a: 1, k: [{ t: delay, s: [0], e: [100] }, { t: delay + 18, s: [100], e: [100] }, { t: delay + 170, s: [100], e: [0] }, { t: delay + 196, s: [0] }] },
      r: { a: 1, k: [{ t: delay, s: [-5], e: [3] }, { t: delay + 144, s: [3], e: [-5] }, { t: delay + 216, s: [-5] }] },
      p: { a: 1, k: keyframes(points) },
      a: { a: 0, k: [0, 0, 0] },
      s: { a: 1, k: [{ t: delay, s: [70, 70, 100], e: [100, 100, 100] }, { t: delay + 30, s: [100, 100, 100], e: [90, 90, 100] }, { t: delay + 180, s: [90, 90, 100], e: [70, 70, 100] }, { t: delay + 216, s: [70, 70, 100] }] },
    },
    shapes: [
      { ty: "rc", d: 1, s: { a: 0, k: [92, 52] }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 11 }, nm: "Information card" },
      { ty: "fl", c: { a: 0, k: gold }, o: { a: 0, k: 100 }, r: 1, nm: "Gold fill" },
      { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 }, sk: { a: 0, k: 0 }, sa: { a: 0, k: 0 }, nm: "Transform" },
    ],
    ao: 0,
    ip: 0,
    op: 240,
    st: 0,
    bm: 1,
  };
}

function pulse(ind: number, point: readonly number[], delay = 84) {
  return {
    ddd: 0,
    ind,
    ty: 4,
    nm: "Connection pulse",
    sr: 1,
    ks: {
      o: { a: 1, k: [{ t: delay, s: [0], e: [72] }, { t: delay + 24, s: [72], e: [0] }, { t: delay + 56, s: [0] }] },
      r: { a: 0, k: 0 },
      p: { a: 0, k: [...point, 0] },
      a: { a: 0, k: [0, 0, 0] },
      s: { a: 1, k: [{ t: delay, s: [35, 35, 100], e: [170, 170, 100] }, { t: delay + 56, s: [170, 170, 100] }] },
    },
    shapes: [
      { ty: "el", p: { a: 0, k: [0, 0] }, s: { a: 0, k: [44, 44] }, nm: "Pulse ring" },
      { ty: "st", c: { a: 0, k: gold }, o: { a: 0, k: 100 }, w: { a: 0, k: 3 }, lc: 2, lj: 2, ml: 4, nm: "Gold stroke" },
      { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 }, sk: { a: 0, k: 0 }, sa: { a: 0, k: 0 }, nm: "Transform" },
    ],
    ao: 0,
    ip: 0,
    op: 240,
    st: 0,
    bm: 1,
  };
}

function createAnimation(illustration: FrictionIllustration) {
  const [signalX, signalY] = illustrations[illustration].signal;
  const paths: Record<FrictionIllustration, readonly number[][]> = {
    data: [[430, 580, 0], [780, 510, 0], [signalX, signalY, 0], [430, 580, 0]],
    repetition: [[520, 430, 0], [1110, 410, 0], [930, 690, 0], [520, 430, 0]],
    leads: [[590, 500, 0], [signalX, signalY, 0], [signalX + 26, signalY + 300, 0], [590, 500, 0]],
    systems: [[590, signalY, 0], [signalX - 70, signalY, 0], [signalX + 70, signalY, 0], [590, signalY, 0]],
    web: [[570, signalY, 0], [signalX, signalY, 0], [1130, signalY, 0], [570, signalY, 0]],
  };

  return {
    v: "5.12.2",
    fr: 30,
    ip: 0,
    op: 240,
    w: 1536,
    h: 1024,
    nm: "STARIX Friction Illustration",
    ddd: 0,
    layers: [
      movingCard(1, "Moving business information", paths[illustration]),
      movingCard(2, "Second information trail", paths[illustration].map(([x, y, z]) => [x - 40, y + 28, z]), 34),
      pulse(3, [signalX, signalY], illustration === "leads" ? 136 : 96),
    ],
  };
}

export default function FrictionLottie({ illustration }: { illustration: FrictionIllustration }) {
  const reducedMotion = useReducedMotion();
  const signalRef = useRef<HTMLDivElement>(null);
  const { file } = illustrations[illustration];
  const animationData = useMemo(() => createAnimation(illustration), [illustration]);

  useEffect(() => {
    const container = signalRef.current;
    if (!container) return;

    const animation = lottie.loadAnimation({
      container,
      renderer: "svg",
      loop: !reducedMotion,
      autoplay: !reducedMotion,
      animationData,
      rendererSettings: { preserveAspectRatio: "xMidYMid slice" },
    });

    if (reducedMotion) animation.goToAndStop(0, true);
    return () => animation.destroy();
  }, [animationData, reducedMotion]);

  return (
    <div className="friction-lottie-scene">
      <Image src={`/friction-lottie/${file}`} alt="" fill sizes="(max-width: 620px) 86vw, 760px" priority />
      <div ref={signalRef} className="friction-lottie-signal" aria-hidden="true" />
    </div>
  );
}
