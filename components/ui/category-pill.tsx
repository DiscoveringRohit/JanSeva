import React from "react";
import { cn } from "@/lib/utils";
import { Droplet, Construction, Sparkles, Trash2, Zap, Car, Trees, ShieldAlert } from "lucide-react";

interface CategoryPillProps {
  category: "Roads" | "Water" | "Sanitation" | "Electricity" | "Waste" | "Traffic" | "Parks" | string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
  count?: number;
}

export function CategoryPill({ category, active, onClick, className, count }: CategoryPillProps) {
  const getIcon = () => {
    switch (category.toLowerCase()) {
      case "water":
        return <Droplet className="w-3.5 h-3.5" />;
      case "roads":
        return <Construction className="w-3.5 h-3.5" />;
      case "sanitation":
        return <Sparkles className="w-3.5 h-3.5" />;
      case "waste":
        return <Trash2 className="w-3.5 h-3.5" />;
      case "electricity":
        return <Zap className="w-3.5 h-3.5" />;
      case "traffic":
        return <Car className="w-3.5 h-3.5" />;
      case "parks":
        return <Trees className="w-3.5 h-3.5" />;
      default:
        return <ShieldAlert className="w-3.5 h-3.5" />;
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer select-none",
        active
          ? "bg-[#134431] text-white shadow-md shadow-emerald-950/20 scale-[1.02]"
          : "bg-[#f8faf9] text-slate-600 hover:bg-[#edf7f1] hover:text-[#134431] border border-slate-200/70",
        className
      )}
    >
      {getIcon()}
      <span>{category}</span>
      {count !== undefined && (
        <span
          className={cn(
            "ml-1 px-1.5 py-0.2 rounded-full text-[10px]",
            active ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}
