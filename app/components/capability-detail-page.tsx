"use client";

import Link from "next/link";
import { useRouteTransition } from "@/app/components/app-shell";

export type CapabilityDetail = {
  index: string;
  hero: string[];
  intro: string;
  buildTitle: string;
  buildCopy: string;
  offerings: string[];
  approachTitle: string;
  approachCopy: string;
  approach: { title: string; copy: string }[];
  flowTitle: string;
  flow: string[];
  capabilitiesTitle: string;
  capabilities: string[];
  principle: string;
  principleAccent: string;
  ctaTitle: string;
  ctaCopy: string;
};

export default function CapabilityDetailPage({ detail }: { detail: CapabilityDetail }) {
  const { returnToCapabilities } = useRouteTransition();

  return (
    <main className="capability-page">
      <section className="capability-hero">
        <div className="capability-hero-grid" aria-hidden="true" />
        <div className="page-shell capability-hero-inner">
          <Link className="capability-back" href="/#servicios" onClick={(event) => { event.preventDefault(); returnToCapabilities(); }}>← Volver a capacidades</Link>
          <p className="capability-index">CAPABILITY / {detail.index}</p>
          <h1>{detail.hero.map((line, index) => <span key={line} className={index === detail.hero.length - 1 ? "capability-hero-accent" : undefined}>{line}{index < detail.hero.length - 1 && <br />}</span>)}</h1>
          <p className="capability-hero-copy">{detail.intro}</p>
          <div className="capability-hero-orbit" aria-hidden="true"><i /><i /><i /><b /></div>
        </div>
      </section>

      <section className="capability-section capability-build"><div className="page-shell">
        <p className="capability-index">01 / QUÉ HACEMOS</p>
        <div className="capability-section-head"><h2>{detail.buildTitle}</h2><p>{detail.buildCopy}</p></div>
        <ul className="product-type-list">{detail.offerings.map((item, index) => <li key={item}><span>{String(index + 1).padStart(2, "0")}</span>{item}<b aria-hidden="true">↗</b></li>)}</ul>
      </div></section>

      <section className="capability-section capability-approach"><div className="page-shell capability-two-column">
        <div><p className="capability-index">02 / ENFOQUE</p><h2>{detail.approachTitle}</h2></div>
        <div className="capability-approach-copy"><p>{detail.approachCopy}</p><div className="capability-triad">{detail.approach.map((item, index) => <article key={item.title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{item.title}</h3><p>{item.copy}</p></article>)}</div></div>
      </div></section>

      <section className="capability-section capability-architecture"><div className="page-shell">
        <p className="capability-index">03 / PROCESO</p><h2>{detail.flowTitle}</h2>
        <ol className="capability-flow">{detail.flow.map((item, index) => <li key={item}><span>{String(index + 1).padStart(2, "0")}</span><strong>{item}</strong>{index < detail.flow.length - 1 && <i aria-hidden="true" />}</li>)}</ol>
      </div></section>

      <section className="capability-section capability-includes"><div className="page-shell capability-two-column">
        <div><p className="capability-index">04 / CAPACIDADES</p><h2>{detail.capabilitiesTitle}</h2></div>
        <ul className="capability-tag-list">{detail.capabilities.map((item) => <li key={item}>{item}</li>)}</ul>
      </div></section>

      <section className="capability-principle"><div className="page-shell"><p>{detail.principle}<br /><span>{detail.principleAccent}</span></p></div></section>
      <section className="capability-final-cta"><div className="page-shell"><p className="capability-index">{detail.index} / 05</p><h2>{detail.ctaTitle}</h2><p>{detail.ctaCopy}</p><Link href="/#contacto" className="capability-cta">Empezar <span aria-hidden="true">↗</span></Link></div></section>
    </main>
  );
}
