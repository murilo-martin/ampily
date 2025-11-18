import type { ContentItem, SidebarLink } from "../types";

export const FALLBACK_SIDEBAR_LINKS: SidebarLink[] = [
  { id: "overview", label: "Conteúdos" },
  { id: "plans", label: "Planos" },
  { id: "schedule", label: "Cronograma" },
  { id: "workshops", label: "WorkShops" },
];

export const FALLBACK_CONTENT_ITEMS: ContentItem[] = [
  {
    id: "strategic-mentoring",
    title: "Mentorias Estratégicas",
    category: "Conteúdos",
    image:
      "https://personalisnadiasantos.com.br/wp-content/uploads/2024/02/Design-sem-nome-3-1024x819.jpg",
    summary:
      "Potencialize a tomada de decisão com suporte de especialistas do mercado.",
  },
  {
    id: "innovation-labs",
    title: "Laboratórios de Inovação",
    category: "Conteúdos",
    image:
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80",
    summary:
      "Espaços colaborativos para prototipar soluções e acelerar resultados.",
  },
  {
    id: "leadership-programs",
    title: "Programas de Liderança",
    category: "Conteúdos",
    image:
      "https://wallpapers.com/images/hd/leadership-pictures-472u004hpq5vbxhr.jpg",
    summary:
      "Treinamentos intensivos para desenvolvimento de líderes de alta performance.",
  },
  {
    id: "business-clinics",
    title: "Clínicas de Negócios",
    category: "Conteúdos",
    image:
      "https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?auto=format&fit=crop&w=800&q=80",
    summary:
      "Diagnósticos rápidos e planos de ação personalizados para MPEs.",
  },
  {
    id: "digital-capacitation",
    title: "Capacitação Digital",
    category: "Conteúdos",
    image:
      "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=800&q=80",
    summary:
      "Workshops e cursos para elevar a maturidade digital do seu negócio.",
  },
  {
    id: "collaboration-hubs",
    title: "Hubs de Colaboração",
    category: "Conteúdos",
    image:
      "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=800&q=80",
    summary:
      "Comunidades temáticas para conexão entre empresas, mentores e investidores.",
  },
];
