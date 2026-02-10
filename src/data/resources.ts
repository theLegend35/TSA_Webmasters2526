export interface Resource {
  id: number;
  name: string;
  category: string;
  description: string;
  phone: string;
  url: string;
}

export const resources: Resource[] = [
  {
    id: 1,
    name: "City Food Bank",
    category: "Food",
    description: "Providing emergency food assistance to local families in need.",
    phone: "(555) 123-4567",
    url: "https://example.com"
  },
  {
    id: 2,
    name: "Central Library",
    category: "Education",
    description: "Free access to books, computers, and educational workshops.",
    phone: "(555) 987-6543",
    url: "https://example.com"
  },
  {
    id: 3,
    name: "Hope Health Clinic",
    category: "Health",
    description: "Low-cost medical services and wellness checkups for the community.",
    phone: "(555) 444-5555",
    url: "https://example.com"
  }
];