import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());

const sidebarLinks = [
  { id: "plans", label: "Planos" },
  { id: "schedule", label: "Cronograma" },
  { id: "workshops", label: "WorkShops" },
];

const contentSections = [
  {
    id: "strategic-mentoring",
    title: "Mentorias Estrategicas",
    category: "Conteudos",
    image:
      "https://personalisnadiasantos.com.br/wp-content/uploads/2024/02/Design-sem-nome-3-1024x819.jpg",
    summary:
      "Potencialize a tomada de decisao com suporte de especialistas do mercado.",
  },
  {
    id: "innovation-labs",
    title: "Laboratorios de Inovacao",
    category: "Conteudos",
    image:
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80",
    summary:
      "Espacos colaborativos para prototipar solucoes e acelerar resultados.",
  },
  {
    id: "leadership-programs",
    title: "Programas de Lideranca",
    category: "Conteudos",
    image:
      "https://wallpapers.com/images/hd/leadership-pictures-472u004hpq5vbxhr.jpg",
    summary:
      "Treinamentos intensivos para desenvolvimento de lideres de alta performance.",
  },
  {
    id: "business-clinics",
    title: "Clinicas de Negocios",
    category: "Conteudos",
    image:
      "https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?auto=format&fit=crop&w=800&q=80",
    summary:
      "Diagnosticos rapidos e planos de acao personalizados para MPEs.",
  },
  {
    id: "digital-capacitation",
    title: "Capacitacao Digital",
    category: "Conteudos",
    image:
      "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=800&q=80",
    summary:
      "Workshops e cursos para elevar a maturidade digital do seu negocio.",
  },
  {
    id: "collaboration-hubs",
    title: "Hubs de Colaboracao",
    category: "Conteudos",
    image:
      "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=800&q=80",
    summary:
      "Comunidades tematicas para conexao entre empresas, mentores e investidores.",
  },
];

app.get("/api/sidebar", (_req, res) => {
  res.json({ links: sidebarLinks });
});

app.get("/api/content", (_req, res) => {
  res.json({ items: contentSections });
});

app.listen(PORT, () => {
  // Log provides quick feedback about server start-up.
  console.log(`Ampliy server listening on port ${PORT}`);
});
