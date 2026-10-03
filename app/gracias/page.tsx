import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Gracias | STARIX",
  description: "Hemos recibido tu información.",
};

export default function ThankYouPage() {
  return (
    <main className="thank-you-page">
      <div className="thank-you-grid" aria-hidden="true" />
      <section className="thank-you-content">
        <p className="section-index">CONTACTO / RECIBIDO</p>
        <div className="thank-you-mark" aria-hidden="true">✦</div>
        <h1>Gracias por<br /><span>escribirnos.</span></h1>
        <p>Recibimos tu información. Revisaremos tu solicitud y te contactaremos pronto.</p>
        <Link href="/" className="thank-you-link">Volver al inicio <span aria-hidden="true">↗</span></Link>
      </section>
    </main>
  );
}
