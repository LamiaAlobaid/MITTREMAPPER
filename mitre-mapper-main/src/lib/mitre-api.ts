import { supabase } from "@/integrations/supabase/client";
import type { MitreMapResult } from "@/types/mitre";

export async function mapToMitre(description: string): Promise<MitreMapResult> {
  const { data, error } = await supabase.functions.invoke("mitre-map", {
    body: { description },
  });

  if (error) {
    throw new Error(error.message || "Failed to analyze incident");
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data as MitreMapResult;
}
