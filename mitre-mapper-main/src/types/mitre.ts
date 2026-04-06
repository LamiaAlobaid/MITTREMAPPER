export interface MitreTechnique {
  tactic: string;
  techniqueId: string;
  techniqueName: string;
  confidence: "high" | "medium" | "low";
  reasoning: string;
}

export interface MitreMapResult {
  summary: string;
  techniques: MitreTechnique[];
}

export const TACTIC_ORDER = [
  "Reconnaissance",
  "Resource Development",
  "Initial Access",
  "Execution",
  "Persistence",
  "Privilege Escalation",
  "Defense Evasion",
  "Credential Access",
  "Discovery",
  "Lateral Movement",
  "Collection",
  "Command and Control",
  "Exfiltration",
  "Impact",
];

export const TACTIC_COLORS: Record<string, string> = {
  "Reconnaissance": "190 100% 50%",
  "Resource Development": "200 90% 48%",
  "Initial Access": "160 100% 45%",
  "Execution": "45 93% 47%",
  "Persistence": "280 80% 55%",
  "Privilege Escalation": "320 80% 55%",
  "Defense Evasion": "35 90% 50%",
  "Credential Access": "0 72% 51%",
  "Discovery": "210 80% 55%",
  "Lateral Movement": "170 70% 45%",
  "Collection": "240 70% 60%",
  "Command and Control": "260 70% 55%",
  "Exfiltration": "10 80% 50%",
  "Impact": "350 80% 55%",
};
