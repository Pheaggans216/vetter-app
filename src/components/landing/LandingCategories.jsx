import { Smartphone, Car, Sofa, Watch, Gem, Wrench, Shirt, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const categories = [
  { label: "Cars & Motorcycles", icon: Car, value: "cars_and_motorcycles", color: "bg-blue-50 text-blue-600" },
  { label: "Electronics", icon: Smartphone, value: "electronics", color: "bg-violet-50 text-violet-600" },
  { label: "Jewelry & Watches", icon: Gem, value: "jewelry_and_watches", color: "bg-amber-50 text-amber-600" },
  { label: "Luxury Fashion", icon: Shirt, value: "luxury_fashion_and_handbags", color: "bg-pink-50 text-pink-600" },
  { label: "Furniture", icon: Sofa, value: "furniture", color: "bg-orange-50 text-orange-600" },
  { label: "Tools & Equipment", icon: Wrench, value: "tools_and_equipment", color: "bg-slate-50 text-slate-600" },
  { label: "Appliances", icon: Home, value: "appliances", color: "bg-cyan-50 text-cyan-600" },
  { label: "Property & Rentals", icon: Watch, value: "rental_or_property_verification", color: "bg-green-50 text-green-600" },
];

export default function LandingCategories() {
  return (
    <section className="max-w-5xl mx-auto px-5 py-20">
      <div className="text-center mb-12">
        <h2 className="text-[30px] font-heading font-bold text-foreground mb-3">What we verify</h2>
        <p className="text-muted-foreground text-[15px] max-w-[400px] mx-auto">
          From cars to couture — our specialists cover every major category of secondhand goods.
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {categories.map((cat, i) => (
          <motion.div
            key={cat.value}
            initial={{ opacity: 0, scale: 0.94 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: i * 0.04 }}
          >
            <Link
              to={`/requests/new?category=${cat.value}`}
              className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-card border border-border/60 hover:border-primary/25 hover:shadow-md transition-all text-center group"
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${cat.color}`}>
                <cat.icon className="w-5 h-5" />
              </div>
              <span className="text-[13px] font-medium text-foreground leading-snug">{cat.label}</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}