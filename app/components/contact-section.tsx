"use client";

import Image from "next/image";
import { FormEvent, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "motion/react";

const interests = [
  { value: "product_platform", label: "Crear un sitio web o producto digital" },
  { value: "automation", label: "Automatizar procesos" },
  { value: "brand_digital_presence", label: "Mejorar mi marca o presencia digital" },
  { value: "unsure", label: "No estoy seguro todavía" },
] as const;

const countryCodes = [
  { value: "+57", label: "Colombia +57" },
  { value: "+1", label: "Estados Unidos +1" },
  { value: "+52", label: "México +52" },
  { value: "+34", label: "España +34" },
  { value: "+54", label: "Argentina +54" },
  { value: "+56", label: "Chile +56" },
  { value: "+51", label: "Perú +51" },
] as const;

type Interest = (typeof interests)[number]["value"];
type SubmitState = "idle" | "submitting" | "success";
type LeadFormData = {
  name: string;
  email: string;
  countryCode: string;
  phone: string;
  company?: string;
  interest: Interest | "";
  consent: boolean;
};
type FormErrors = Partial<Record<keyof LeadFormData, string>>;

const initialForm: LeadFormData = {
  name: "",
  email: "",
  countryCode: "+57",
  phone: "",
  company: "",
  interest: "",
  consent: false,
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[0-9 ()+-]+$/;

function NeedIcon({ type }: { type: Interest }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 20 20",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.25,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (type === "automation") return <svg {...common}><path d="M3 15.8h14M4.5 13V9.5M8.2 13V5.8M11.8 13V8M15.5 13V3.5" /></svg>;
  if (type === "product_platform") return <svg {...common}><rect x="3" y="3.5" width="14" height="13" rx="2" /><path d="M3 7.5h14M7 3.5v4" /></svg>;
  if (type === "brand_digital_presence") return <svg {...common}><circle cx="10" cy="10" r="7" /><path d="M3.5 10h13M10 3c2 2 2 12 0 14M10 3c-2 2-2 12 0 14" /></svg>;
  return <svg {...common}><circle cx="10" cy="10" r="7" /><path d="M8.2 7.6a2 2 0 1 1 2.4 2c-.6.2-.6.8-.6 1.4M10 14h.01" /></svg>;
}

function MailIcon() {
  return <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden="true"><rect x="2.5" y="4" width="15" height="12" rx="2" /><path d="m3.5 6 6.5 5 6.5-5" /></svg>;
}

function PhoneIcon() {
  return <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden="true"><path d="M6.2 3.5 8.4 3l1.2 3-1.6 1.2a11 11 0 0 0 4.8 4.8L14 10.4l3 1.2-.5 2.2c-.2 1-1.1 1.7-2.1 1.5A12.5 12.5 0 0 1 4.7 5.6c-.2-1 .5-1.9 1.5-2.1Z" /></svg>;
}

export default function ContactSection() {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const contactRef = useRef<HTMLElement>(null);
  const { scrollYProgress: depthProgress } = useScroll({ target: contactRef, offset: ["start end", "end start"] });
  const starfieldY = useTransform(depthProgress, [0, 1], prefersReducedMotion ? [0, 0] : [58, -46]);
  const moonY = useTransform(depthProgress, [0, 1], prefersReducedMotion ? [0, 0] : [250, -185]);
  const planetY = useTransform(depthProgress, [0, 1], prefersReducedMotion ? [0, 0] : [184, -146]);
  const starY = useTransform(depthProgress, [0, 1], prefersReducedMotion ? [0, 0] : [116, -96]);
  const [form, setForm] = useState<LeadFormData>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [submitError, setSubmitError] = useState("");

  const updateField = <K extends keyof LeadFormData>(field: K, value: LeadFormData[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const validate = (data: LeadFormData): FormErrors => {
    const nextErrors: FormErrors = {};
    if (data.name.trim().length < 2) nextErrors.name = "Cuéntanos cómo te llamas.";
    if (!emailPattern.test(data.email.trim())) nextErrors.email = "Introduce un correo válido.";
    if (!data.phone.trim()) nextErrors.phone = "Necesitamos tu número para continuar.";
    else if (!phonePattern.test(data.phone.trim()) || data.phone.replace(/\D/g, "").length < 7) nextErrors.phone = "Introduce un número válido.";
    if (!data.interest) nextErrors.interest = "Selecciona qué quieres mejorar.";
    if (!data.consent) nextErrors.consent = "Debes aceptar los términos y condiciones para continuar.";
    return nextErrors;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitState("submitting");
    setSubmitError("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          company: form.company?.trim() || "",
          page: window.location.pathname,
        }),
      });

      if (!response.ok) throw new Error("contact_submission_failed");
      router.push("/gracias");
    } catch {
      setSubmitError("No pudimos enviar tus datos. Inténtalo de nuevo o escríbenos por WhatsApp.");
      setSubmitState("idle");
    }
  };

  const formReady = useMemo(() => Boolean(form.name.trim() && form.email.trim() && form.phone.trim() && form.interest && form.consent), [form]);

  return (
    <section ref={contactRef} id="contacto" className="contact section-dark">
      <div className="page-shell contact-layout">
        <motion.div
          className="contact-heading"
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="section-index">06 / CONTACTO</p>
          <motion.div className="contact-title-mask" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.35 }}>
            <motion.h2
              variants={{ hidden: { y: prefersReducedMotion ? 0 : "104%" }, visible: { y: 0 } }}
              transition={{ duration: 0.82, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              ¿Construimos algo que <span className="contact-title-accent">realmente funcione?</span>
            </motion.h2>
          </motion.div>
        </motion.div>

        <motion.div
          className="contact-form-shell"
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, delay: prefersReducedMotion ? 0 : 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          <AnimatePresence mode="wait">
            {submitState === "success" ? (
              <motion.div key="success" className="contact-success contact-form-success" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} role="status">
                <p className="contact-kicker">DATOS RECIBIDOS.</p>
                <h3>Perfecto. El formulario está listo para continuar con el siguiente paso.</h3>
                <button className="contact-reset" type="button" onClick={() => { setForm(initialForm); setErrors({}); setSubmitState("idle"); }}>Volver al formulario</button>
              </motion.div>
            ) : (
              <motion.form key="form" onSubmit={handleSubmit} noValidate exit={{ opacity: 0 }}>
                <p className="contact-form-title">EMPECEMOS</p>

                <div className="contact-field">
                  <label htmlFor="contact-name">NOMBRE</label>
                  <div className={errors.name ? "contact-input has-error" : "contact-input"}>
                    <input id="contact-name" name="name" type="text" placeholder="¿Cómo te llamas?" autoComplete="name" value={form.name} onChange={(event) => updateField("name", event.target.value)} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "contact-name-error" : undefined} />
                  </div>
                  {errors.name && <p id="contact-name-error" className="contact-error" role="alert">{errors.name}</p>}
                </div>

                <div className="contact-field">
                  <label htmlFor="contact-email">CORREO</label>
                  <div className={errors.email ? "contact-input has-error" : "contact-input"}>
                    <MailIcon />
                    <input id="contact-email" name="email" type="email" placeholder="nombre@empresa.com" autoComplete="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "contact-email-error" : undefined} />
                  </div>
                  {errors.email && <p id="contact-email-error" className="contact-error" role="alert">{errors.email}</p>}
                </div>

                <div className="contact-field">
                  <label htmlFor="contact-phone">WHATSAPP</label>
                  <div className={errors.phone ? "contact-phone-row has-error" : "contact-phone-row"}>
                    <div className="contact-country-wrap">
                      <select id="contact-country" aria-label="Código de país" value={form.countryCode} onChange={(event) => updateField("countryCode", event.target.value)}>
                        {countryCodes.map((country) => <option key={country.value} value={country.value}>{country.label}</option>)}
                      </select>
                    </div>
                    <div className="contact-input contact-phone-input">
                      <PhoneIcon />
                      <input id="contact-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="300 000 0000" value={form.phone} onChange={(event) => updateField("phone", event.target.value)} aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? "contact-phone-error" : undefined} />
                    </div>
                  </div>
                  {errors.phone && <p id="contact-phone-error" className="contact-error" role="alert">{errors.phone}</p>}
                </div>

                <div className="contact-field">
                  <label htmlFor="contact-company">EMPRESA <span>(OPCIONAL)</span></label>
                  <div className="contact-input">
                    <input id="contact-company" name="company" type="text" placeholder="Nombre de tu empresa" autoComplete="organization" value={form.company} onChange={(event) => updateField("company", event.target.value)} />
                  </div>
                </div>

                <fieldset className="contact-needs">
                  <legend>¿QUÉ QUIERES MEJORAR?</legend>
                  <div className="contact-options">
                    {interests.map((option) => (
                      <div className="contact-option" key={option.value}>
                        <input id={`contact-interest-${option.value}`} type="radio" name="interest" value={option.value} checked={form.interest === option.value} onChange={() => updateField("interest", option.value)} />
                        <label htmlFor={`contact-interest-${option.value}`}><NeedIcon type={option.value} /><span>{option.label}</span><i aria-hidden="true" /></label>
                      </div>
                    ))}
                  </div>
                  {errors.interest && <p className="contact-error" role="alert">{errors.interest}</p>}
                </fieldset>

                <div className="contact-submit-group">
                  <div className={errors.consent ? "contact-consent has-error" : "contact-consent"}>
                    <input id="contact-consent" name="consent" type="checkbox" checked={form.consent} onChange={(event) => updateField("consent", event.target.checked)} aria-invalid={Boolean(errors.consent)} aria-describedby={errors.consent ? "contact-consent-error" : undefined} />
                    <label htmlFor="contact-consent">Acepto los términos y condiciones del servicio y el tratamiento de mis datos.</label>
                  </div>
                  {errors.consent && <p id="contact-consent-error" className="contact-error" role="alert">{errors.consent}</p>}
                  <button className="contact-submit" type="submit" disabled={submitState === "submitting"}>
                    <span>{submitState === "submitting" ? "Preparando…" : "Empezar"}</span>
                    <span className="contact-submit-arrow" aria-hidden="true">↗</span>
                  </button>
                  {submitError && <p className="contact-submit-error" role="alert">{submitError}</p>}
                  <p className="contact-form-note">Te pedimos solo la información necesaria para iniciar.</p>
                </div>
                {!formReady && <span className="sr-only">Completa los campos obligatorios para continuar.</span>}
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <div className="contact-depth">
        <motion.div className="contact-starfield" style={{ y: starfieldY }} aria-hidden="true"><div className="contact-starfield-drift"><Image src="/brand/contact-starfield-v2.png" alt="" fill sizes="100vw" priority={false} /></div></motion.div>
        <motion.div className="contact-star" style={{ y: starY }} aria-hidden="true"><div className="contact-star-drift"><Image src="/brand/contact-star-realistic.png" alt="" fill sizes="(max-width: 620px) 18vw, 7vw" priority={false} /></div></motion.div>
        <motion.div className="contact-orbit-planet" style={{ y: planetY }} aria-hidden="true"><div className="contact-planet-drift"><Image src="/brand/contact-orbit-planet-realistic.png" alt="" fill sizes="(max-width: 620px) 30vw, 10vw" priority={false} /></div></motion.div>
        <motion.div className="contact-earth" style={{ y: moonY }} aria-hidden="true"><div className="contact-moon-drift"><Image src="/brand/contact-moon-horizon-transparent.png" alt="" fill sizes="100vw" priority={false} /></div></motion.div>
      </div>
    </section>
  );
}
