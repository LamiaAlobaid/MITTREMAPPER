import { motion } from "framer-motion";
import type { MitreTechnique } from "@/types/mitre";
import { TACTIC_COLORS } from "@/types/mitre";
import { Shield, ChevronRight } from "lucide-react";

const confidenceConfig = {
  high: { label: "HIGH", className: "bg-confidence-high/15 text-confidence-high border-confidence-high/30" },
  medium: { label: "MED", className: "bg-confidence-medium/15 text-confidence-medium border-confidence-medium/30" },
  low: { label: "LOW", className: "bg-confidence-low/15 text-confidence-low border-confidence-low/30" },
};

export function TechniqueCard({ technique, index }: { technique: MitreTechnique; index: number }) {
  const conf = confidenceConfig[technique.confidence];
  const tacticHsl = TACTIC_COLORS[technique.tactic] || "190 100% 50%";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="group relative rounded-lg border border-border bg-card p-4 hover:border-primary/30 transition-all duration-300"
      style={{
        borderLeftWidth: "3px",
        borderLeftColor: `hsl(${tacticHsl})`,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="font-mono text-xs font-semibold px-1.5 py-0.5 rounded"
              style={{
                backgroundColor: `hsl(${tacticHsl} / 0.12)`,
                color: `hsl(${tacticHsl})`,
              }}
            >
              {technique.techniqueId}
            </span>
            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${conf.className}`}>
              {conf.label}
            </span>
          </div>
          <h3 className="font-medium text-sm text-foreground mb-1">{technique.techniqueName}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">{technique.reasoning}</p>
        </div>
        <a
          href={`https://attack.mitre.org/techniques/${technique.techniqueId.replace(".", "/")}/`}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 p-1.5 rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
          title="View on MITRE ATT&CK"
        >
          <ChevronRight className="w-4 h-4" />
        </a>
      </div>
      <div className="mt-2 pt-2 border-t border-border/50">
        <span
          className="text-[10px] font-mono uppercase tracking-wider"
          style={{ color: `hsl(${tacticHsl} / 0.7)` }}
        >
          {technique.tactic}
        </span>
      </div>
    </motion.div>
  );
}
