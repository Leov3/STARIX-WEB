"use client";

import { useEffect, useId, useRef, useState } from "react";
import styles from "./capability-artwork.module.css";

export type ArtworkKind = "product" | "automation" | "integration" | "brand" | "strategy";

const descriptions: Record<ArtworkKind, string> = {
  product: "Une interface web et une application partagent une même architecture de données.",
  automation: "Un événement est validé, puis orienté vers une action automatique ou une révision humaine.",
  integration: "Ventas, inventario, facturación y CRM se conectan a una misma capa de integración.",
  brand: "La identidad STARIX se expresa mediante tipografía, color y aplicaciones digitales coherentes.",
  strategy: "El diagnóstico se transforma en prioridades, arquitectura y una ruta de implementación.",
};
// All geometry is visible in the initial HTML. Only a short emphasis travels through the artwork.
export default function CapabilityArtwork({ kind, selected = 0, replay = 0, decorative = false }: {
  kind: ArtworkKind; selected?: number; replay?: number; decorative?: boolean;
}) {
  const id = useId().replaceAll(":", "");
  const ref = useRef<HTMLDivElement>(null);
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element || !window.IntersectionObserver) return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        setEntered(true);
        observer.disconnect();
      }
    }, { threshold: .12 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const active = (step: number) => selected === step ? styles.selected : undefined;
  const frame = (x: number, y: number, width: number, height: number, radius = 14) => <rect x={x} y={y} width={width} height={height} rx={radius} className={styles.surface} />;
  const label = (x: number, y: number, text: string, centered = false) => <text x={x} y={y} textAnchor={centered ? "middle" : "start"} className={styles.label}>{text}</text>;
  const note = (x: number, y: number, text: string, centered = false) => <text x={x} y={y} textAnchor={centered ? "middle" : "start"} className={styles.note}>{text}</text>;

  return <div ref={ref} className={styles.artwork} data-entered={entered} data-kind={kind}>
    <svg viewBox="0 0 640 480" role={decorative ? undefined : "img"} aria-hidden={decorative || undefined} aria-labelledby={decorative ? undefined : `${id}-title`}>
      <title id={`${id}-title`}>{descriptions[kind]}</title>
      <defs>
        <linearGradient id={`${id}-surface`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#25262b" /><stop offset="1" stopColor="#111216" /></linearGradient>
        <radialGradient id={`${id}-glow`}><stop stopColor="#c8a24a" stopOpacity=".14" /><stop offset="1" stopColor="#c8a24a" stopOpacity="0" /></radialGradient>
        <pattern id={`${id}-grid`} width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0H0V32" fill="none" stroke="#f7f7f2" strokeOpacity=".045" /></pattern>
      </defs>
      <rect width="640" height="480" fill={`url(#${id}-grid)`} />
      <ellipse cx="340" cy="244" rx="300" ry="230" fill={`url(#${id}-glow)`} />
      {kind === "product" && <>
        <g className={styles.backPlane}>
          <rect x="44" y="48" width="474" height="310" rx="16" fill={`url(#${id}-surface)`} stroke="#77796f" />
          <path d="M44 98H518 M154 98V358" className={styles.rule} />
          <circle cx="67" cy="74" r="4" fill="#c8a24a" /><circle cx="83" cy="74" r="4" fill="#70716a" /><circle cx="99" cy="74" r="4" fill="#70716a" />
          {note(177, 80, "TU PRODUCTO / WEB")}
          <image href="/brand/starix-mark.png" x="76" y="124" width="42" height="42" />
          <path d="M70 198H126 M70 229H116 M70 260H121 M70 291H100" className={styles.rule} />
          {label(178, 144, "Todo en su lugar.")}
          {note(178, 174, "Personas · procesos · datos")}
          <g className={active(2)}>{frame(178, 200, 144, 124, 8)}{note(194, 229, "EXPERIENCIA")}<path d="M194 250H292 M194 267H273 M194 284H282" className={styles.rule} /><rect x="194" y="300" width="50" height="5" rx="2" fill="#c8a24a" /></g>
          <g className={active(1)}>{frame(337, 200, 155, 124, 8)}{note(353, 229, "SISTEMA")}<path d="M363 266H464 M389 249V284 M438 249V284" className={styles.rule} /><circle cx="389" cy="266" r="8" fill="#c8a24a" /><circle cx="438" cy="266" r="8" fill="#202125" stroke="#c8a24a" /></g>
        </g>
        <g className={`${styles.frontPlane} ${active(4) ?? ""}`}>
          <rect x="431" y="157" width="164" height="279" rx="24" fill="#191b20" stroke="#98998b" />
          <rect x="487" y="172" width="52" height="5" rx="2" fill="#63665e" />
          <image href="/brand/starix-mark.png" x="452" y="197" width="35" height="35" />
          {label(452, 266, "Conectado.")}<path d="M452 285H568 M452 301H548" className={styles.rule} />
          <rect x="452" y="326" width="121" height="52" rx="8" fill="#c8a24a" />
          <path d="M479 352H544 M532 341L544 352L532 363" stroke="#171611" strokeWidth="2" fill="none" />
          <rect x="487" y="416" width="52" height="4" rx="2" fill="#63665e" />
        </g>
        <g className={active(3)}><path d="M102 358V401Q102 411 112 411H401" className={styles.connector} /><path key={`product-${replay}`} d="M102 358V401Q102 411 112 411H401" className={styles.signal} />{note(153, 439, "UNA MISMA ARQUITECTURA")}</g>
      </>}
      {kind === "automation" && <>
        <path d="M236 95H376 M466 137V176Q466 190 452 190H334 M320 260V300 M320 300H149Q135 300 135 314V343 M320 300H490Q504 300 504 314V343" className={styles.connector} />
        <path key={`auto-${replay}`} d="M236 95H376 M466 137V176Q466 190 452 190H334 M320 260V300H149Q135 300 135 314V343" className={styles.signal} />
        <g className={active(0)}>{frame(34, 44, 202, 94)}{note(54, 72, "01 / ENTRADA")}{label(54, 109, "Nuevo evento")}</g>
        <g className={active(1)}>{frame(376, 44, 229, 94)}{note(396, 72, "02 / REGLAS")}{label(396, 109, "Validar datos")}</g>
        <g className={active(2)}><path d="M320 160L419 214L320 268L221 214Z" fill="#25231a" stroke="#c8a24a" strokeWidth="1.5" />{label(320, 220, "¿Requiere IA?", true)}</g>
        {note(104, 324, "REGLA CLARA")}{note(403, 324, "CON CRITERIO")}
        <g className={active(3)}>{frame(28, 344, 240, 94)}{note(48, 374, "03 / EJECUCIÓN")}{label(48, 410, "Acción automática")}</g>
        <g className={active(4)}>{frame(369, 344, 241, 94)}{note(389, 374, "04 / CONTROL")}{label(389, 410, "Revisión humana")}</g>
        <circle cx="306" cy="95" r="5" fill="#c8a24a" />
      </>}
      {kind === "integration" && <>
        <path d="M113 136V218Q113 237 132 237H229 M526 136V218Q526 237 507 237H411 M113 357V265Q113 245 132 245H229 M526 357V265Q526 245 507 245H411" className={styles.connector} />
        <path key={`integration-${replay}`} d="M113 136V218Q113 237 132 237H229 M411 237H507Q526 237 526 218V136 M411 245H507Q526 245 526 265V357" className={styles.signal} />
        {[["Ventas", "PEDIDOS", 24, 42], ["Inventario", "DISPONIBILIDAD", 436, 42], ["Facturación", "DOCUMENTOS", 24, 355], ["CRM", "RELACIONES", 436, 355]].map(([name, copy, x, y], index) => <g key={name} className={active(index)}>{frame(Number(x), Number(y), 180, 88)}{label(Number(x) + 90, Number(y) + 38, String(name), true)}{note(Number(x) + 90, Number(y) + 64, String(copy), true)}</g>)}
        <g className={active(4)}><rect x="222" y="170" width="196" height="140" rx="20" fill={`url(#${id}-surface)`} stroke="#c8a24a" strokeWidth="1.5" /><image href="/brand/starix-mark.png" x="292" y="183" width="54" height="54" />{label(320, 263, "Integración", true)}{note(320, 287, "DATOS + REGLAS", true)}</g>
        <circle cx="113" cy="201" r="5" fill="#c8a24a" /><circle cx="526" cy="281" r="5" fill="#c8a24a" />
        {note(320, 465, "HERRAMIENTAS DISTINTAS. UNA OPERACIÓN.", true)}
      </>}
      {kind === "brand" && <>
        <g className={`${styles.backPlane} ${active(0) ?? ""}`}><rect x="30" y="38" width="350" height="235" rx="12" fill="#f0eee5" /><text x="54" y="158" fill="#17191c" fontSize="105" letterSpacing="-9">Aa.</text><text x="58" y="204" fill="#41433e" fontSize="19">Una voz reconocible.</text><path d="M58 236H347" stroke="#c2bfb1" /></g>
        <g className={active(1)}><rect x="402" y="38" width="206" height="174" rx="12" fill="#22231e" stroke="#707466" /><image href="/brand/starix-mark.png" x="447" y="47" width="116" height="116" />{note(505, 190, "IDENTIDAD", true)}</g>
        <g className={active(2)}><rect x="402" y="230" width="58" height="44" rx="7" fill="#c8a24a" /><rect x="476" y="230" width="58" height="44" rx="7" fill="#eeece2" /><rect x="550" y="230" width="58" height="44" rx="7" fill="#253349" /></g>
        <g className={`${styles.frontPlane} ${active(3) ?? ""}`}><rect x="102" y="294" width="506" height="153" rx="12" fill={`url(#${id}-surface)`} stroke="#73776a" /><image href="/brand/starix-wordmark.png" x="127" y="315" width="111" height="14" />{label(127, 370, "Una presencia")}{label(127, 400, "con dirección.")}<rect x="430" y="337" width="150" height="72" rx="8" fill="#c8a24a" /><path d="M480 373H533 M522 361L534 373L522 385" fill="none" stroke="#171611" strokeWidth="2" /></g>
      </>}
      {kind === "strategy" && <>
        <path d="M122 87H545 M122 87V164 M320 87V164 M545 87V164" className={styles.connector} />
        <g className={active(0)}><circle cx="122" cy="87" r="30" fill="#1c1e22" stroke="#7e8378" />{label(122, 94, "01", true)}{note(122, 146, "ENTENDER", true)}</g>
        <g className={active(1)}><circle cx="320" cy="87" r="30" fill="#29251b" stroke="#c8a24a" />{label(320, 94, "02", true)}{note(320, 146, "PRIORIZAR", true)}</g>
        <g className={active(2)}><circle cx="545" cy="87" r="30" fill="#1c1e22" stroke="#7e8378" />{label(545, 94, "03", true)}{note(545, 146, "CONECTAR", true)}</g>
        <rect x="30" y="178" width="580" height="270" rx="14" fill={`url(#${id}-surface)`} stroke="#77796f" />
        {note(52, 210, "RUTA DE IMPLEMENTACIÓN")}
        <path d="M52 228H588 M178 228V425 M300 228V425 M422 228V425 M546 228V425" className={styles.faintRule} />
        <g className={active(2)}><rect x="55" y="246" width="207" height="44" rx="6" fill="#464335" />{label(71, 275, "Arquitectura")}</g>
        <g className={active(3)}><rect x="205" y="309" width="240" height="44" rx="6" fill="#c8a24a" /><text x="223" y="338" className={styles.darkLabel}>Implementación</text></g>
        <g className={active(4)}><rect x="389" y="374" width="197" height="44" rx="6" fill="#303b42" />{label(407, 403, "Evolución")}</g>
        <path key={`strategy-${replay}`} d="M262 267H285V332H445V396H578" className={styles.signal} />
      </>}
    </svg>
  </div>;
}
