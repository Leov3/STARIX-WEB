import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de tratamiento de datos | STARIX",
  description: "Borrador de la política de tratamiento de datos personales de STARIX.",
};

export default function PrivacyPage() {
  return <main className="privacy-page"><article className="privacy-content">
    <p className="section-index">STARIX / PRIVACIDAD</p>
    <h1>Política de tratamiento de datos personales</h1>
    <p className="privacy-notice"><strong>Borrador para revisión legal.</strong> Este texto debe ser aprobado y completado con la razón social, NIT, canales de contacto y responsable de tratamiento antes de considerarse versión definitiva.</p>
    <p>Fecha de publicación: 27 de octubre de 2026 · Versión: borrador 0.1</p>
    <h2>1. Responsable y alcance</h2><p>STARIX tratará los datos que una persona entregue al solicitar información, completar el diagnóstico, agendar una videollamada o comunicarse por los canales habilitados. Antes de su publicación definitiva se incorporarán los datos de identificación y contacto del responsable.</p>
    <h2>2. Datos y finalidades</h2><p>Podemos tratar nombre, correo, teléfono o WhatsApp, empresa, necesidad inicial, respuestas del diagnóstico y datos de reserva. Los usamos para responder la solicitud, crear o actualizar el registro comercial en Odoo, preparar y dar seguimiento a conversaciones comerciales, coordinar reservas e invitaciones y mejorar el proceso de atención.</p>
    <h2>3. Autorización</h2><p>El checkbox del formulario registra la autorización para las finalidades descritas. Conservaremos la fecha, la versión del texto y el estado de ese consentimiento. No usamos las respuestas del diagnóstico para decisiones automatizadas con efectos jurídicos sobre la persona.</p>
    <h2>4. Encargados y transferencias</h2><p>Para prestar el servicio pueden intervenir proveedores tecnológicos, incluidos Odoo, n8n, correo y la plataforma de reservas. STARIX deberá documentar los encargados, medidas de seguridad y, si aplica, transferencias internacionales antes del lanzamiento.</p>
    <h2>5. Derechos y consultas</h2><p>La persona titular puede conocer, actualizar, rectificar o solicitar la supresión de sus datos, así como revocar la autorización cuando proceda. El canal y procedimiento formal para ejercer estos derechos serán completados tras la revisión legal.</p>
    <h2>6. Conservación y seguridad</h2><p>Los datos se conservarán únicamente durante el tiempo necesario para las finalidades autorizadas, obligaciones legales y defensa de reclamaciones. STARIX aplicará controles de acceso y medidas técnicas y organizativas proporcionales para protegerlos.</p>
    <h2>7. Cambios</h2><p>Las modificaciones relevantes se publicarán en esta página indicando su fecha y versión.</p>
  </article></main>;
}
