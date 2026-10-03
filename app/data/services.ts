export type Service = {
  id: string;
  slug: string;
  title: string;
  text: string;
  visible?: boolean;
};

export const services: Service[] = [
  {
    id: "01",
    slug: "productos-plataformas-digitales",
    title: "Productos y plataformas digitales",
    text: "Sitios, plataformas y productos digitales diseñados alrededor de objetivos reales de negocio.",
  },
  {
    id: "02",
    slug: "automatizacion-ia",
    title: "Automatización e IA",
    text: "Procesos más inteligentes, menos tareas manuales y sistemas que trabajan contigo.",
  },
  {
    id: "03",
    visible: false,
    slug: "sistemas-integraciones",
    title: "Implementaciones e integraciones",
    text: "Implementamos CRM, ERP, Odoo y otras herramientas, y las conectamos para que la operación deje de fragmentarse.",
  },
  {
    id: "04",
    slug: "marca-presencia-digital",
    title: "Marca y presencia digital",
    text: "Identidades y experiencias digitales que comunican con claridad el nivel de tu negocio.",
  },
  {
    id: "05",
    visible: false,
    slug: "estrategia-arquitectura-digital",
    title: "Estrategia y arquitectura digital",
    text: "Definimos qué construir, qué conectar y qué debe cambiar antes de elegir una herramienta.",
  },
];
