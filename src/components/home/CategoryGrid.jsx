import { Link } from "react-router-dom";
import { Smartphone, Car, Sofa, Watch, Gem, Wrench, Shirt, Dumbbell } from "lucide-react";
import { motion } from "framer-motion";

const categories = [
  { label: "Electronics", icon: Smartphone, value: "electronics" },
  { label: "Vehicles", icon: Car, value: "vehicles" },
  { label: "Furniture", icon: Sofa, value: "furniture" },
  { label: "Collectibles", icon: Watch, value: "collectibles" },
  { label: "Jewelry", icon: Gem, value: "jewelry" },
  { label: "Tools", icon: Wrench, value: "tools" },
  { label: "Clothing", icon: Shirt, value: "clothing" },
  { label: "Sports", icon: Dumbbell, value: "sporting_goods" },
];

export default function CategoryGrid() {
  return (
    <section className="px-5 py-6">
      <h3 className="text-lg font-heading font-semibold text-foreground mb-4">
        Popular categories
      </h3>
      <div className="grid grid-cols-4 gap-3">
        {categories.map((cat, i) => (
          <motion.div
            key={cat.value}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: i * 0.04 }}
          >
            <Link
              to={`/requests/new?category=${cat.value}`}
              className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-card border border-border/60 shadow-sm hover:shadow-md hover:border-primary/20 transition-all"
            >
              <cat.icon className="w-6 h-6 text-primary" />
              <span className="text-[11px] font-medium text-foreground text-center leading-tight">
                {cat.label}
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}