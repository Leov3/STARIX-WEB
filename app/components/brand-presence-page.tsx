"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { useRouteTransition } from "@/app/components/app-shell";

const services = [
  { number: "01", title: "Estrategia\nde marca", copy: "Definimos la esencia, la narrativa y la posición que hace que una marca sea fácil de reconocer.", image: true },
  { number: "02", title: "Sistemas de\nidentidad", copy: "Construimos un sistema visual sólido y flexible para todos los puntos de contacto.", dark: true, identity: true },
  { number: "03", title: "Presencia\ndigital", copy: "Diseñamos experiencias digitales que presentan, comunican y convierten.", image: true, digital: true },
];

function IdentityParallax() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const landscapeY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [-34, 34]);

  return <div ref={ref} className="brand-identity-parallax" aria-hidden="true">
    <motion.div className="brand-identity-landscape" style={{ y: landscapeY }}><Image src="/brand/brand-identity-parallax.png" alt="" fill sizes="(max-width: 620px) 100vw, 58vw" /></motion.div>
    <div className="brand-identity-showcase">
      <div className="brand-identity-showcase-set">
        <div className="brand-identity-panel brand-identity-panel-type"><Image src="/brand/stock/stock-stone.jpg" alt="" fill sizes="(max-width: 620px) 31vw, 14vw" /></div>
        <div className="brand-identity-panel brand-identity-panel-editorial"><Image src="/brand/stock/stock-portrait.jpg" alt="" fill sizes="(max-width: 620px) 40vw, 20vw" /></div>
        <div className="brand-identity-panel brand-identity-panel-main"><Image src="/brand/stock/stock-landscape.jpg" alt="" fill sizes="(max-width: 620px) 47vw, 24vw" /></div>
        <div className="brand-identity-panel brand-identity-panel-mark"><Image src="/brand/stock/stock-brutalist.jpg" alt="" fill sizes="(max-width: 620px) 36vw, 18vw" /></div>
        <div className="brand-identity-panel brand-identity-panel-wordmark"><Image src="/brand/stock/stock-architecture.jpg" alt="" fill sizes="(max-width: 620px) 40vw, 20vw" /></div>
      </div>
      <div className="brand-identity-showcase-set" aria-hidden="true">
        <div className="brand-identity-panel brand-identity-panel-type"><Image src="/brand/stock/stock-stone.jpg" alt="" fill sizes="(max-width: 620px) 31vw, 14vw" /></div>
        <div className="brand-identity-panel brand-identity-panel-editorial"><Image src="/brand/stock/stock-portrait.jpg" alt="" fill sizes="(max-width: 620px) 40vw, 20vw" /></div>
        <div className="brand-identity-panel brand-identity-panel-main"><Image src="/brand/stock/stock-landscape.jpg" alt="" fill sizes="(max-width: 620px) 47vw, 24vw" /></div>
        <div className="brand-identity-panel brand-identity-panel-mark"><Image src="/brand/stock/stock-brutalist.jpg" alt="" fill sizes="(max-width: 620px) 36vw, 18vw" /></div>
        <div className="brand-identity-panel brand-identity-panel-wordmark"><Image src="/brand/stock/stock-architecture.jpg" alt="" fill sizes="(max-width: 620px) 40vw, 20vw" /></div>
      </div>
    </div>
  </div>;
}

export default function BrandPresencePage() {
  const { returnToCapabilities } = useRouteTransition();

  return (
    <main className="brand-studio-page">
      <section className="brand-studio-hero">
        <div className="brand-studio-grid" aria-hidden="true" />
        <div className="page-shell brand-studio-hero-inner">
          <Link className="brand-studio-back" href="/#servicios" onClick={(event) => { event.preventDefault(); returnToCapabilities(); }}>← Volver a capacidades</Link>
          <p className="brand-studio-index">04 /<br />ESTUDIO<br />STARIX</p>
          <h1>Marca &amp;<br />presencia<br />digital</h1>
          <p className="brand-studio-intro">Identidades que conectan.<br />Experiencias que trascienden.</p>
          <ul className="brand-studio-words" aria-label="Disciplinas de marca"><li>Identidad</li><li>Dirección</li><li>Web</li><li>Experiencia</li><li>Contenido</li></ul>
          <a className="brand-studio-scroll" href="#brand-servicios" aria-label="Ver servicios">↓</a>
        </div>
      </section>

      <section id="brand-servicios" className="brand-studio-services" aria-label="Servicios de marca">
        {services.map((service, index) => (
          <article className={`brand-studio-service ${service.dark ? "is-dark" : "is-light"} ${service.identity ? "is-identity-feature" : ""}`} key={service.number}>
            <div className="brand-studio-service-copy">
              <span>{service.number}</span>
              <h2>{service.title.split("\n").map((line) => <span key={line}>{line}</span>)}</h2>
              <p>{service.copy}</p>
              </div>
              <div className={`brand-studio-service-visual visual-${index + 1}`} aria-hidden="true">
                {service.identity ? <IdentityParallax /> : service.digital ? <Image src="/brand/brand-digital-moodboard.png" alt="" fill sizes="(max-width: 720px) 100vw, 56vw" /> : service.image ? <Image src="/brand/brand-editorial-collage.png" alt="" fill sizes="(max-width: 720px) 100vw, 56vw" /> : <><Image className="brand-studio-mark" src="/brand/starix-mark.png" alt="" width={294} height={295} /><Image className="brand-studio-wordmark" src="/brand/starix-wordmark.png" alt="" width={684} height={81} /></>}
            </div>
          </article>
        ))}
      </section>

      <section className="brand-studio-closing">
        <div className="page-shell"><p className="brand-studio-index">DE FRAGMENTOS<br />A SISTEMA</p><h2>Una marca no es una capa decorativa.<br /><span>Es la forma en que el negocio se vuelve reconocible.</span></h2><Link href="/#contacto">Hablemos de tu marca <span>→</span></Link></div>
      </section>
    </main>
  );
}
