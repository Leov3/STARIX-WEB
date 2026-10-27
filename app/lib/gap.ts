export const GAP_VERSION = "starix-diagnostic-v2";
export const GAP_SESSION_KEY = "starix-diagnostic-session";

export const interestToBranch = {
  product_platform: "WEB_PRODUCT",
  automation: "AUTOMATION",
  brand_digital_presence: "BRAND_DIGITAL",
  unsure: "UNDEFINED",
} as const;

export type GapBranch = (typeof interestToBranch)[keyof typeof interestToBranch];
export type GapAnswers = Record<string, string>;
export type GapQualification = "HIGH_PRIORITY" | "MEDIUM_PRIORITY" | "MANUAL_REVIEW" | "PENDING";
export type GapOption = { value: string; label: string };
export type GapQuestion = { id: string; prompt: string; options: readonly GapOption[]; required: true };

const option = (value: string, label: string): GapOption => ({ value, label });
const timing = { id: "start_timeline", prompt: "¿Cuándo te gustaría comenzar?", options: [option("WITHIN_FOUR_WEEKS", "En las próximas 4 semanas."), option("ONE_TO_THREE_MONTHS", "En 1 a 3 meses."), option("LATER", "Más adelante."), option("EXPLORING", "Aún estoy explorando.")], required: true } as const;
const authority = { id: "decision_power", prompt: "¿Qué papel tienes en esta decisión?", options: [option("DECIDES", "Tomo la decisión personalmente."), option("SHARED_DECISION", "Decido con un socio o equipo."), option("RECOMMENDS", "Recomiendo, pero no tomo la decisión final."), option("RESEARCHING", "Estoy investigando opciones.")], required: true } as const;
const investment = { id: "budget_range", prompt: "¿Qué inversión aproximada contemplas?", options: [option("BELOW_2M", "Menos de $2.000.000 COP."), option("BUDGET_2_TO_5M", "Entre $2.000.000 y $5.000.000 COP."), option("BUDGET_5_TO_10M", "Entre $5.000.000 y $10.000.000 COP."), option("BUDGET_OVER_10M", "Más de $10.000.000 COP."), option("UNDEFINED_BUDGET", "Necesito orientación para definirla.")], required: true } as const;

const branches: Record<GapBranch, readonly GapQuestion[]> = {
  WEB_PRODUCT: [
    { id: "project_stage", prompt: "¿En qué etapa está tu proyecto?", options: [option("IDEA", "Tengo una idea."), option("REQUIREMENTS", "Ya tengo requisitos definidos."), option("PROTOTYPE", "Tengo diseño o prototipo."), option("EXISTING_PRODUCT", "Tengo un producto que quiero mejorar.")], required: true },
    { id: "solution_type", prompt: "¿Qué quieres construir o mejorar?", options: [option("CORPORATE_SITE", "Sitio web corporativo."), option("ECOMMERCE", "Tienda en línea."), option("WEB_APP", "Aplicación web o plataforma."), option("PRODUCT_IMPROVEMENT", "Producto digital existente.")], required: true },
    { id: "main_goal", prompt: "¿Cuál es tu objetivo principal?", options: [option("LEADS", "Generar más oportunidades."), option("SELL", "Vender en línea."), option("OPERATE", "Optimizar una operación."), option("VALIDATE", "Validar una idea."), option("EXPERIENCE", "Mejorar la experiencia actual.")], required: true }, timing, authority, investment,
  ],
  AUTOMATION: [
    { id: "process_area", prompt: "¿Qué proceso quieres automatizar?", options: [option("SALES", "Ventas y seguimiento."), option("SUPPORT", "Atención al cliente."), option("OPERATIONS", "Operaciones internas."), option("DATA", "Datos y reportes."), option("MULTIPLE", "Varios procesos.")], required: true },
    { id: "main_problem", prompt: "¿Qué está ocurriendo hoy?", options: [option("MANUAL", "Hay tareas manuales repetitivas."), option("ERRORS", "Hay errores o retrabajo."), option("DISCONNECTED", "Las herramientas están desconectadas."), option("VISIBILITY", "Falta visibilidad del proceso."), option("CLEAR_OTHER", "Tengo otro problema claro.")], required: true },
    { id: "expected_impact", prompt: "¿Qué impacto esperas?", options: [option("SAVE_TIME", "Ahorrar tiempo."), option("REDUCE_ERRORS", "Reducir errores."), option("FASTER_RESPONSE", "Responder más rápido."), option("INTEGRATE", "Integrar sistemas."), option("SCALE", "Escalar la operación.")], required: true }, timing, authority, investment,
  ],
  BRAND_DIGITAL: [
    { id: "brand_area", prompt: "¿Qué área quieres mejorar?", options: [option("IDENTITY", "Identidad de marca."), option("DIGITAL_PRESENCE", "Sitio o presencia digital."), option("POSITIONING", "Posicionamiento."), option("COMMUNICATION", "Comunicación."), option("TRANSFORMATION", "Transformación integral.")], required: true },
    { id: "current_presence", prompt: "¿Cómo está hoy tu presencia?", options: [option("NONE", "Aún no tengo presencia."), option("BASIC", "Tengo una presencia básica."), option("OUTDATED", "Mi marca se ve desactualizada."), option("SITE_EXISTS", "Tengo sitio, pero necesita mejorar."), option("CONSOLIDATED", "Tengo una marca consolidada.")], required: true },
    { id: "expected_result", prompt: "¿Qué resultado buscas?", options: [option("TRUST", "Generar más confianza."), option("ATTRACT", "Atraer clientes."), option("DIFFERENTIATE", "Diferenciarme."), option("LAUNCH", "Lanzar una oferta."), option("ORGANIZE", "Ordenar mi experiencia de marca.")], required: true }, timing, authority, investment,
  ],
  UNDEFINED: [
    { id: "contact_motivation", prompt: "¿Qué te motivó a contactarnos?", options: [option("CLIENTS", "Conseguir o atender más clientes."), option("OPERATIONS", "Ordenar mi operación."), option("PRESENCE", "Fortalecer mi presencia."), option("IDEA", "Lanzar una idea."), option("MULTIPLE", "Varias áreas.")], required: true },
    { id: "urgency_context", prompt: "¿Qué se siente más urgente?", options: [option("BLOCKER", "Tengo un bloqueo claro."), option("OPPORTUNITY", "Quiero aprovechar una oportunidad."), option("GUIDANCE", "Necesito orientación."), option("EXPLORING", "Estoy explorando opciones.")], required: true },
    { id: "clarity_level", prompt: "¿Qué tan claro tienes el siguiente paso?", options: [option("CLEAR", "Sé qué necesito."), option("OPTIONS", "Tengo varias opciones."), option("NEEDS_DEFINITION", "Necesito ayuda para definirlo."), option("UNKNOWN", "Aún no lo sé.")], required: true }, timing, authority, investment,
  ],
};

export const questionsForBranch = (branch: GapBranch): GapQuestion[] => [...branches[branch]];
export const isGapBranch = (value: unknown): value is GapBranch => typeof value === "string" && Object.values(interestToBranch).includes(value as GapBranch);
export const validateGapAnswer = (question: GapQuestion, value: unknown) => typeof value !== "string" || !question.options.some(({ value: optionValue }) => optionValue === value) ? "Selecciona una opción para continuar." : null;

export function evaluateQualification(branch: GapBranch, answers: GapAnswers) {
  const complete = questionsForBranch(branch).every((question) => !validateGapAnswer(question, answers[question.id]));
  if (!complete) return { qualificationStatus: "PENDING" as const, qualificationReason: "INCOMPLETE_DIAGNOSTIC", score: 0 };
  const funded = ["BUDGET_2_TO_5M", "BUDGET_5_TO_10M", "BUDGET_OVER_10M"].includes(answers.budget_range);
  if (!funded) return { qualificationStatus: "MANUAL_REVIEW" as const, qualificationReason: "BUDGET_UNDEFINED_OR_BELOW_MINIMUM", score: 5 };
  const timely = answers.start_timeline === "WITHIN_FOUR_WEEKS";
  const empowered = ["DECIDES", "SHARED_DECISION"].includes(answers.decision_power);
  const clear = branch === "UNDEFINED" ? answers.clarity_level === "CLEAR" : true;
  const score = 30 + (timely ? 25 : answers.start_timeline === "ONE_TO_THREE_MONTHS" ? 15 : 5) + (answers.decision_power === "DECIDES" ? 20 : answers.decision_power === "SHARED_DECISION" ? 15 : 5) + (clear ? 25 : 10);
  return timely && empowered && clear
    ? { qualificationStatus: "HIGH_PRIORITY" as const, qualificationReason: "READY_TO_DISCOVER", score }
    : { qualificationStatus: "MEDIUM_PRIORITY" as const, qualificationReason: "QUALIFIED_NEEDS_FOLLOW_UP", score };
}
