export const GAP_VERSION = "starix-gap-v1";
export const GAP_SESSION_KEY = "starix-gap-session";

export const interestToBranch = {
  product_platform: "WEB_PRODUCT",
  automation: "AUTOMATION",
  brand_digital_presence: "BRAND_DIGITAL",
  unsure: "UNDEFINED",
} as const;

export type GapBranch = (typeof interestToBranch)[keyof typeof interestToBranch];
export type GapAnswer = string;
export type GapAnswers = Record<string, GapAnswer>;
export type GapQualification = "PENDING" | "QUALIFIED" | "MANUAL_REVIEW" | "FOLLOW_UP";
export type GapStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

export type GapOption = { value: string; label: string };
export type GapQuestion = {
  id: string;
  prompt: string;
  help?: string;
  type: "choice" | "text";
  options?: readonly GapOption[];
  required: true;
};

const choice = (value: string, label: string): GapOption => ({ value, label });

const sharedQuestions = [
  {
    id: "budget_range",
    prompt: "¿Qué presupuesto aproximado tienes contemplado para este proyecto?",
    type: "choice",
    options: [
      choice("BELOW_MINIMUM", "Menos de $2.800.000 COP."),
      choice("BUDGET_2_8_TO_5", "Entre $2.800.000 y $5.000.000 COP."),
      choice("BUDGET_5_TO_10", "Más de $5.000.000 y hasta $10.000.000 COP."),
      choice("BUDGET_10_TO_20", "Más de $10.000.000 y hasta $20.000.000 COP."),
      choice("BUDGET_OVER_20", "Más de $20.000.000 COP."),
      choice("UNDEFINED_BUDGET", "Necesito orientación para definir el presupuesto."),
    ],
    required: true,
  },
  {
    id: "start_timeline",
    prompt: "¿Cuándo te gustaría comenzar el proyecto?",
    type: "choice",
    options: [
      choice("ASAP", "Lo antes posible."),
      choice("TWO_TO_FOUR_WEEKS", "En las próximas 2–4 semanas."),
      choice("ONE_TO_THREE_MONTHS", "En los próximos 1–3 meses."),
      choice("THREE_TO_SIX_MONTHS", "Dentro de 3–6 meses."),
      choice("EXPLORING", "Aún estoy explorando opciones."),
    ],
    required: true,
  },
] as const satisfies readonly GapQuestion[];

const branches: Record<GapBranch, readonly GapQuestion[]> = {
  WEB_PRODUCT: [
    { id: "solution_type", prompt: "¿Qué tipo de solución quieres desarrollar?", type: "choice", options: [choice("CORPORATE_SITE", "Sitio web corporativo o institucional."), choice("ECOMMERCE", "Tienda en línea."), choice("WEB_APP", "Aplicación web o plataforma."), choice("CUSTOM_SOFTWARE", "Software a medida."), choice("MODERNIZE", "Modernización de un sistema existente.")], required: true },
    { id: "main_problem", prompt: "¿Qué problema necesitas resolver con esta solución?", help: "Cuéntanos qué sucede actualmente y por qué necesitas desarrollar o mejorar esta solución.", type: "text", required: true },
    { id: "project_stage", prompt: "¿En qué etapa se encuentra tu proyecto?", type: "choice", options: [choice("IDEA", "Solo tengo la idea."), choice("REQUIREMENTS", "Tengo algunos requisitos definidos."), choice("PROTOTYPES", "Ya cuento con diseños o prototipos."), choice("EXISTING_SOLUTION", "Tengo una solución funcionando que necesita mejoras.")], required: true },
    { id: "user_scale", prompt: "¿Cuántas personas utilizarán esta solución?", type: "choice", options: [choice("ONE_TO_FIVE", "Entre 1 y 5."), choice("SIX_TO_TWENTY", "Entre 6 y 20."), choice("TWENTY_ONE_TO_HUNDRED", "Entre 21 y 100."), choice("OVER_HUNDRED", "Más de 100."), choice("PUBLIC_OR_CLIENTS", "Será una solución pública o para clientes."), choice("UNKNOWN", "Todavía no lo sé.")], required: true },
    { id: "expected_results", prompt: "¿Qué resultados esperas conseguir cuando el proyecto esté funcionando?", help: "Imagina que la solución ya está terminada. ¿Qué tendría que haber cambiado para considerar que fue un éxito?", type: "text", required: true },
  ],
  AUTOMATION: [
    { id: "automation_area", prompt: "¿Qué área necesitas automatizar?", type: "choice", options: [choice("CUSTOMER_SERVICE", "Atención al cliente."), choice("SALES_FOLLOW_UP", "Ventas y seguimiento comercial."), choice("OPERATIONS", "Operaciones y tareas internas."), choice("DATA_REPORTS", "Gestión de datos y reportes."), choice("MULTIPLE", "Varios procesos.")], required: true },
    { id: "main_problem", prompt: "¿Qué proceso te está generando dificultades actualmente?", help: "Describe cómo funciona hoy y qué inconvenientes produce.", type: "text", required: true },
    { id: "current_process", prompt: "¿Cómo gestionas actualmente ese proceso?", type: "choice", options: [choice("MANUAL", "De forma manual."), choice("SHEETS", "Mediante Excel o Google Sheets."), choice("DISCONNECTED_TOOLS", "Con varias herramientas desconectadas."), choice("EXISTING_SOFTWARE", "Con software que necesita mejoras."), choice("NO_PROCESS", "Todavía no existe un proceso establecido.")], required: true },
    { id: "process_participants", prompt: "¿Cuántas personas participan en ese proceso?", type: "choice", options: [choice("ONE_TO_FIVE", "Entre 1 y 5."), choice("SIX_TO_TWENTY", "Entre 6 y 20."), choice("TWENTY_ONE_TO_FIFTY", "Entre 21 y 50."), choice("OVER_FIFTY", "Más de 50."), choice("UNKNOWN", "Todavía no lo sé.")], required: true },
    { id: "expected_results", prompt: "¿Qué resultados esperas obtener al automatizarlo?", help: "Piensa en reducción de tiempos, errores, costos, mejoras en la atención o capacidad operativa.", type: "text", required: true },
  ],
  BRAND_DIGITAL: [
    { id: "brand_need", prompt: "¿Qué necesita principalmente tu marca?", type: "choice", options: [choice("NEW_IDENTITY", "Crear una identidad desde cero."), choice("RENEW_IDENTITY", "Renovar una identidad existente."), choice("ONLINE_PRESENCE", "Mejorar mi presencia en internet."), choice("POSITIONING", "Mejorar posicionamiento y comunicación."), choice("DIGITAL_TRANSFORMATION", "Una transformación digital integral.")], required: true },
    { id: "main_problem", prompt: "¿Qué consideras que no está funcionando actualmente en tu marca?", help: "Si es una marca nueva, cuéntanos qué oportunidad deseas aprovechar.", type: "text", required: true },
    { id: "brand_stage", prompt: "¿En qué etapa se encuentra tu negocio o marca?", type: "choice", options: [choice("NEW_IDEA", "Es una nueva idea o emprendimiento."), choice("PRE_LAUNCH", "Estoy próximo a lanzar."), choice("OPERATING_IMPROVING", "Ya opera y necesita mejorar."), choice("CONSOLIDATED", "Es una marca consolidada que busca evolucionar.")], required: true },
    { id: "business_scale", prompt: "¿Qué alcance tiene actualmente tu negocio?", type: "choice", options: [choice("INDEPENDENT", "Profesional independiente o emprendimiento."), choice("SMALL", "Empresa pequeña."), choice("MEDIUM", "Empresa mediana."), choice("LARGE", "Empresa grande."), choice("UNINCORPORATED", "Proyecto todavía sin constituir.")], required: true },
    { id: "expected_results", prompt: "¿Qué resultados esperas conseguir con este proyecto?", help: "Piensa en reconocimiento, percepción, posicionamiento y experiencia digital.", type: "text", required: true },
  ],
  UNDEFINED: [
    { id: "improvement_area", prompt: "¿Qué área de tu negocio necesitas mejorar?", type: "choice", options: [choice("CLIENTS", "Conseguir o atender más clientes."), choice("OPERATIONS", "Organizar y optimizar operaciones."), choice("ONLINE_PRESENCE", "Fortalecer mi presencia digital."), choice("NEW_IDEA", "Desarrollar una idea nueva."), choice("MULTIPLE", "Varias áreas a la vez.")], required: true },
    { id: "main_problem", prompt: "¿Qué situación te hizo buscar ayuda de Starix?", help: "Cuéntanos qué sucede actualmente y qué te gustaría cambiar.", type: "text", required: true },
    { id: "support_type", prompt: "¿Qué tipo de acompañamiento crees que necesitas?", type: "choice", options: [choice("SOLUTION_DEFINITION", "Orientación para definir una solución."), choice("TECH_IMPLEMENTATION", "Desarrollo o implementación tecnológica."), choice("BRAND", "Mejorar mi marca o presencia digital."), choice("INTEGRATED", "Una solución integral."), choice("UNKNOWN", "Todavía no lo tengo claro.")], required: true },
    { id: "business_stage", prompt: "¿En qué etapa se encuentra tu negocio?", type: "choice", options: [choice("IDEA", "Todavía es una idea."), choice("STARTING", "Estoy iniciando operaciones."), choice("GROWING", "Ya opero y necesito crecer."), choice("CONSOLIDATED", "Tengo una empresa consolidada."), choice("PERSONAL", "Es un proyecto personal.")], required: true },
    { id: "expected_results", prompt: "Si trabajáramos juntos, ¿qué te gustaría haber conseguido al finalizar?", help: "No necesitas saber cómo lograrlo. Queremos conocer el resultado que buscas.", type: "text", required: true },
  ],
};

export const questionsForBranch = (branch: GapBranch): GapQuestion[] => [...branches[branch], ...sharedQuestions];

export function isGapBranch(value: unknown): value is GapBranch {
  return typeof value === "string" && Object.values(interestToBranch).includes(value as GapBranch);
}

export function validateGapAnswer(question: GapQuestion, value: unknown) {
  if (typeof value !== "string") return "Selecciona o escribe una respuesta para continuar.";
  const answer = value.trim();
  if (!answer) return "Completa esta respuesta para continuar.";
  if (question.type === "text") return answer.length > 2_000 ? "La respuesta debe tener máximo 2.000 caracteres." : null;
  return question.options?.some((option) => option.value === answer) ? null : "Selecciona una opción válida.";
}

export function evaluateQualification(branch: GapBranch, answers: GapAnswers) {
  const questions = questionsForBranch(branch);
  const hasCompleteAnswers = questions.every((question) => !validateGapAnswer(question, answers[question.id]));
  if (!hasCompleteAnswers) return { qualificationStatus: "PENDING" as const, qualificationReason: "INCOMPLETE_DIAGNOSTIC" };
  if (answers.budget_range === "BELOW_MINIMUM") return { qualificationStatus: "MANUAL_REVIEW" as const, qualificationReason: "BUDGET_BELOW_MINIMUM" };
  if (answers.budget_range === "UNDEFINED_BUDGET") return { qualificationStatus: "MANUAL_REVIEW" as const, qualificationReason: "BUDGET_UNDEFINED" };
  return { qualificationStatus: "QUALIFIED" as const, qualificationReason: "BUDGET_COMPATIBLE" };
}
