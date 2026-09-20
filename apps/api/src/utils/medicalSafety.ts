/*
 * Deterministic safety backstops shared by every AI-generated health
 * feature (full analysis, quick check, ...). Prompt instructions reduce
 * how often the model violates a hard rule, but they are not a
 * guarantee - these checks never trust the model's own restraint.
 */

/*
 * Emergency-keyword escalation. This never lowers urgency, it can only
 * push a result toward "urgent" / directing to real care.
 */
export const EMERGENCY_KEYWORDS = [
  "chest pain",
  "difficulty breathing",
  "shortness of breath",
  "can't breathe",
  "cannot breathe",
  "suicidal",
  "kill myself",
  "severe bleeding",
  "uncontrolled bleeding",
  "one-sided weakness",
  "one sided weakness",
  "slurred speech",
  "face drooping",
  "loss of consciousness",
  "unconscious",
  "seizure",
  "anaphylaxis",
  "severe allergic reaction",
  "coughing blood",
  "vomiting blood",
];

export const EMERGENCY_MESSAGE =
  "What you described may indicate a medical emergency. Please seek immediate in-person or emergency medical care rather than waiting for further guidance.";

export const containsEmergencyKeyword = (text: string) => {
  const normalized = text.toLowerCase();
  return EMERGENCY_KEYWORDS.some((keyword) => normalized.includes(keyword));
};

/*
 * Drug-name scrubber. Prompts instruct the model to never name a specific
 * medication, but in testing it still occasionally did (e.g.
 * "acetaminophen or ibuprofen"). This redacts known drug names from any
 * AI-generated text before it is stored or returned.
 */
const KNOWN_DRUG_NAMES = [
  "acetaminophen", "paracetamol", "tylenol",
  "ibuprofen", "advil", "motrin",
  "aspirin", "naproxen", "aleve",
  "diphenhydramine", "benadryl",
  "loratadine", "claritin",
  "cetirizine", "zyrtec",
  "pseudoephedrine", "sudafed",
  "dextromethorphan", "guaifenesin", "mucinex",
  "omeprazole", "ranitidine", "famotidine", "pepcid",
  "loperamide", "imodium",
  "bismuth subsalicylate", "pepto-bismol", "pepto bismol",
  "hydrocortisone",
  "amoxicillin", "azithromycin", "doxycycline",
  "metformin", "atorvastatin", "lisinopril", "levothyroxine",
  "prednisone", "albuterol",
  "oxycodone", "hydrocodone", "codeine", "morphine", "tramadol",
  "sertraline", "fluoxetine", "alprazolam", "lorazepam", "diazepam",
  "warfarin", "clopidogrel", "amlodipine", "losartan", "metoprolol",
  "gabapentin", "montelukast", "singulair",
];

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const DRUG_NAME_PATTERN = new RegExp(
  `\\b(${KNOWN_DRUG_NAMES.map(escapeRegExp).join("|")})\\b`,
  "gi"
);

export const redactDrugNames = (text: string) =>
  text.replace(DRUG_NAME_PATTERN, "an appropriate over-the-counter option");
