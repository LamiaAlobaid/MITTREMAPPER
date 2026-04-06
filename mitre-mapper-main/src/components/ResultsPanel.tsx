import { motion } from "framer-motion";
import type { MitreMapResult } from "@/types/mitre";
import { TACTIC_ORDER } from "@/types/mitre";
import { TechniqueCard } from "./TechniqueCard";
import { Shield } from "lucide-react";

export function ResultsPanel({ result }: { result: MitreMapResult }) {
  // Group techniques by tactic
  const grouped = result.techniques.reduce((acc, t) => {
    if (!acc[t.tactic]) acc[t.tactic] = [];
    acc[t.tactic].push(t);
    return acc;
  }, {} as Record<string, typeof result.techniques>);

  const sortedTactics = Object.keys(grouped).sort(
    (a, b) => (TACTIC_ORDER.indexOf(a) ?? 99) - (TACTIC_ORDER.indexOf(b) ?? 99)
  );

  const highCount = result.techniques.filter((t) => t.confidence === "high").length;
  const medCount = result.techniques.filter((t) => t.confidence === "medium").length;
  const lowCount = result.techniques.filter((t) => t.confidence === "low").length;

  return (
    <div className="space-y-6">
      {/* Summary header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-lg border border-primary/20 bg-primary/5 p-4 cyber-glow"
      >
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <div>
            <h2 className="font-mono text-sm font-semibold text-primary mb-1">Analysis Complete</h2>
            <p className="text-sm text-foreground/80">{result.summary}</p>
            <div className="flex gap-4 mt-3 font-mono text-xs">
              <span className="text-confidence-high">{highCount} high</span>
              <span className="text-confidence-medium">{medCount} medium</span>
              <span className="text-confidence-low">{lowCount} low</span>
              <span className="text-muted-foreground">
                {result.techniques.length} technique{result.techniques.length !== 1 ? "s" : ""} mapped
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Technique cards grouped by tactic */}
      {sortedTactics.map((tactic) => (
        <div key={tactic}>
          <div className="grid gap-3 sm:grid-cols-2">
            {grouped[tactic].map((technique, i) => (
              <TechniqueCard key={technique.techniqueId + i} technique={technique} index={i} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
