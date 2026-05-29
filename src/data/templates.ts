import { WebsiteTemplate } from "../types";

export const TEMPLATES: WebsiteTemplate[] = [
  {
    id: "saas",
    name: "Nova Analytics",
    description: "SaaS layout with dark dashboard widgets, charts, and key statistics metrics.",
    category: "Software / SaaS",
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
    accentColor: "#6366f1" // Indigo
  },
  {
    id: "fintech",
    name: "PayVolt Dashboard",
    description: "Modern minimalist bank payment portal displaying transaction lists and virtual card layouts.",
    category: "Finance",
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
    accentColor: "#10b981" // Emerald
  },
  {
    id: "portfolio",
    name: "Kenzo Architects",
    description: "High-contrast geometric brutalist layouts, typography showcase, and masonry galleries.",
    category: "Portfolio / Agency",
    imageUrl: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80",
    accentColor: "#d97706" // Amber-Warm
  },
  {
    id: "shop",
    name: "Aura Lifestyle Store",
    description: "Premium retail layout showcasing product grids, large headers, and sleek review blocks.",
    category: "E-Commerce",
    imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80",
    accentColor: "#ec4899" // Pink
  }
];
