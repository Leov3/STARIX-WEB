import HeroParallax from "@/app/components/hero-parallax";
import CapabilitiesTypewriter from "@/app/components/capabilities-typewriter";
import ServiceList from "@/app/components/service-list";
import ContactSection from "@/app/components/contact-section";
import { ApproachSection, FrictionSection, ManifestoSection, ProcessSection } from "@/app/components/scroll-sections";
import { services } from "@/app/data/services";
import Image from "next/image";

const process: Array<readonly [string, string, string]> = [
  ["01", "Diagnóstico", "Entender el contexto, detectar la fricción real y definir qué necesita cambiar."],
  ["02", "Arquitectura", "Diseñar una estructura clara que conecte personas, procesos y tecnología."],
  ["03", "Construcción", "Convertir la arquitectura en una solución funcional, útil y preparada para crecer."],
  ["04", "Implementación", "Poner el sistema en marcha y acompañar a las personas que lo utilizan."],
  ["05", "Evolución", "Medir resultados, aprender del uso y mejorar el sistema continuamente."],
];

export default function Home() {
  return (
    <>
      <main id="top">
        <HeroParallax />

        <section id="servicios" className="services section-dark">
          <div className="page-shell">
            <div className="section-head split-head">
              <p className="section-index">01 / CAPACIDADES</p>
              <CapabilitiesTypewriter />
            </div>
            <ServiceList services={services} />
          </div>
        </section>

        <ApproachSection />

        <FrictionSection />

        <ProcessSection steps={process} />

        <ManifestoSection />

        <ContactSection />
      </main>

      <footer className="footer section-dark">
        <div className="page-shell footer-grid">
          <div>
            <Image className="footer-logo" src="/brand/starix-lockup.png" alt="STARIX" width={1013} height={294} sizes="155px" />
            <p>Technology · Creativity · Systems</p>
          </div>
          <div className="footer-links">
            <a href="#servicios">Servicios</a>
            <a href="#proceso">Proceso</a>
            <a href="#contacto">Contacto</a>
          </div>
          <p className="footer-line">El futuro no necesita elegidos.<br />Necesita mejores sistemas.</p>
          <div className="copyright">
            <p>© {new Date().getFullYear()} STARIX<br />starix.tech</p>
            <a className="footer-top" href="#top">Volver arriba <span aria-hidden="true">↑</span></a>
          </div>
        </div>
      </footer>
    </>
  );
}
