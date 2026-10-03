"use client";

import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import type { Service } from "@/app/data/services";
import { useRouteTransition } from "@/app/components/app-shell";

export default function ServiceList({ services }: { services: Service[] }) {
  const visibleServices = services.filter((service) => service.visible !== false);
  return (
    <div className="service-list">
      {visibleServices.map((service, index) => (
        <ServiceRow key={service.id} service={service} index={index} />
      ))}
    </div>
  );
}

function ServiceRow({ service, index }: { service: Service; index: number }) {
  const prefersReducedMotion = useReducedMotion();
  const { goToCapability } = useRouteTransition();
  const capabilityRoutes: Record<string, string> = {
    "productos-plataformas-digitales": "productos-plataformas",
    "automatizacion-ia": "automatizacion-ia",
    "sistemas-integraciones": "implementaciones-integraciones",
    "marca-presencia-digital": "marca-presencia-digital",
    "estrategia-arquitectura-digital": "estrategia-arquitectura-digital",
  };
  const capabilityRoute = capabilityRoutes[service.slug];
  const isProductsPlatforms = service.slug === "productos-plataformas-digitales";

  const content = <>
    <span className="service-number">{String(index + 1).padStart(2, "0")}</span>
    <h3 data-mobile-title={isProductsPlatforms ? "Productos digitales" : undefined}>{service.title}</h3>
    <p>{service.text}</p>
    <span className="service-plus" aria-hidden="true">+</span>
  </>;

  return (
    <motion.article
      id={service.slug}
      className={`service-row ${capabilityRoute ? "service-row-interactive" : ""}`}
      initial={{ opacity: 1, y: prefersReducedMotion ? 0 : 24 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ amount: 0.05, once: false }}
      transition={{ duration: 0.7, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      {capabilityRoute ? (
        <Link className="service-row-link" href={`/capacidades/${capabilityRoute}`} onClick={(event) => { event.preventDefault(); goToCapability(capabilityRoute); }}>
          {content}
        </Link>
      ) : content}
    </motion.article>
  );
}
