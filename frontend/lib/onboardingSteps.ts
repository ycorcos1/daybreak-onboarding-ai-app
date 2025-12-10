export const ONBOARDING_STEPS = [
  "parent-info",
  "child-info",
  "screener",
  "intake",
  "insurance",
  "cost",
  "scheduling",
  "consent",
  "review",
];

export const STEP_LABELS: Record<string, string> = {
  "parent-info": "Parent info",
  "child-info": "Child info",
  screener: "AI screener",
  intake: "Intake",
  insurance: "Insurance",
  cost: "Cost",
  scheduling: "Scheduling",
  consent: "Consent",
  review: "Review",
};

export function getNextStep(current: string) {
  const index = ONBOARDING_STEPS.indexOf(current);
  if (index === -1 || index === ONBOARDING_STEPS.length - 1) return current;
  return ONBOARDING_STEPS[index + 1];
}

export function getPreviousStep(current: string) {
  const index = ONBOARDING_STEPS.indexOf(current);
  if (index <= 0) return current;
  return ONBOARDING_STEPS[index - 1];
}


