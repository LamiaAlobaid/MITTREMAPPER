import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Crosshair, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResultsPanel } from "@/components/ResultsPanel";
import { mapToMitre } from "@/lib/mitre-api";
import type { MitreMapResult } from "@/types/mitre";
import { toast } from "sonner";

const EXAMPLE_INCIDENTS = [
  "An employee received a Word document via email. Upon opening, a macro executed PowerShell commands that downloaded a second-stage payload from a remote server. The payload established persistence via a scheduled task and began exfiltrating browser credentials.",
  "Attackers exploited a vulnerable public-facing web application to gain initial access. They used living-off-the-land binaries to enumerate the network, moved laterally via RDP, and deployed ransomware across multiple systems.",
  "A USB device was plugged into a workstation in the lobby. It deployed a keylogger that captured domain admin credentials. The attacker then used pass-the-hash to access the domain controller and created a rogue admin account.",
];

export default function Index() {
  const [description, setDescription] = useState("");
  const [result, setResult] = useState<MitreMapResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!description.trim()) {
      toast.error("Please enter an incident description");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const data = await mapToMitre(description);
      setResult(data);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid-bg">
      <div className="scan-line min-h-screen">
        {/* Header */}
        <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="container max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <Crosshair className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-mono text-lg font-bold text-foreground tracking-tight">
                MITRE<span className="text-primary">Mapper</span>
              </h1>
              <p className="text-xs text-muted-foreground font-mono">ATT&CK Technique Mapping Engine</p>
            </div>
          </div>
        </header>

        <main className="container max-w-5xl mx-auto px-4 py-8 space-y-8">
          {/* Input Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <label className="block font-mono text-xs text-muted-foreground uppercase tracking-wider mb-2">
              Incident Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the security incident in detail..."
              rows={5}
              className="w-full rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground/40 p-4 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all resize-none"
            />
            <div className="flex items-center justify-between mt-3">
              <div className="flex gap-2 flex-wrap">
                {EXAMPLE_INCIDENTS.map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => setDescription(ex)}
                    className="text-[11px] font-mono px-2.5 py-1 rounded border border-border text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors"
                  >
                    Example {i + 1}
                  </button>
                ))}
              </div>
              <Button
                variant="cyber"
                size="lg"
                onClick={handleAnalyze}
                disabled={loading || !description.trim()}
                className="font-mono"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    Map to ATT&CK
                  </>
                )}
              </Button>
            </div>
          </motion.section>

          {/* Loading state */}
          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-3 py-12"
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                  <Crosshair className="w-5 h-5 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <p className="font-mono text-xs text-muted-foreground animate-pulse-glow">
                  Mapping techniques...
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results */}
          <AnimatePresence>
            {result && !loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ResultsPanel result={result} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty state */}
          {!result && !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              className="text-center py-16"
            >
              <AlertTriangle className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
              <p className="font-mono text-sm text-muted-foreground/50">
                Enter an incident description to begin mapping
              </p>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}
