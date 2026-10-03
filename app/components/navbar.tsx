"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const links = [
  ["Servicios", "#servicios"],
  ["Enfoque", "#enfoque"],
  ["Proceso", "#proceso"],
  ["Contacto", "#contacto"],
];

export default function Navbar() {
  const headerRef = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const homePrefix = pathname === "/" ? "" : "/";
  const closeNavigation = () => setOpen(false);

  useEffect(() => {
    const updateNav = () => setScrolled(window.scrollY > 24);
    updateNav();
    window.addEventListener("scroll", updateNav, { passive: true });
    return () => window.removeEventListener("scroll", updateNav);
  }, []);

  useEffect(() => {
    const viewport = window.visualViewport;
    const syncViewportOffset = () => headerRef.current?.style.setProperty("--visual-viewport-top", `${viewport?.offsetTop ?? 0}px`);
    syncViewportOffset();
    viewport?.addEventListener("scroll", syncViewportOffset);
    viewport?.addEventListener("resize", syncViewportOffset);
    return () => {
      viewport?.removeEventListener("scroll", syncViewportOffset);
      viewport?.removeEventListener("resize", syncViewportOffset);
    };
  }, []);

  return (
    <header ref={headerRef} className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
      <nav className={`nav-shell ${open ? "is-open" : ""}`} aria-label="Navegación principal">
        <a href={`${homePrefix}#top`} className="brand" aria-label="STARIX, inicio" onClick={closeNavigation}>
          <Image className="brand-mark" src="/brand/starix-mark.png" alt="" width={294} height={295} sizes="36px" priority />
          <Image className="brand-wordmark" src="/brand/starix-wordmark.png" alt="STARIX" width={684} height={81} sizes="124px" priority />
        </a>
        <div className="nav-links">
          {links.map(([label, href]) => <a key={href} href={`${homePrefix}${href}`} onClick={closeNavigation}>{label}</a>)}
        </div>
        <a className="nav-cta" href={`${homePrefix}#contacto`} onClick={closeNavigation}>Hablemos de tu proyecto</a>
        <button className="menu-button" type="button" onClick={() => setOpen(!open)} aria-label={open ? "Cerrar menú" : "Abrir menú"} aria-expanded={open} aria-controls="mobile-menu">
          <span className="menu-label">{open ? "Cerrar" : "Menú"}</span><span className="menu-icon" aria-hidden="true">+</span>
        </button>
        <div id="mobile-menu" className="mobile-menu">
          {links.map(([label, href]) => <a key={href} href={`${homePrefix}${href}`} onClick={closeNavigation}>{label}</a>)}
          <a href={`${homePrefix}#contacto`} onClick={closeNavigation}>Hablemos de tu proyecto ↗</a>
        </div>
      </nav>
    </header>
  );
}
