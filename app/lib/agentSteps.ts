export const AGENT_STEPS = [
  {
    id: 'image-acquisition',
    name: 'Image Acquisition',
    description: 'Loading camera frame and preprocessing image data',
  },
  {
    id: 'ocr-extraction',
    name: 'OCR Text Extraction',
    description: 'Extracting text from product packaging using vision AI',
  },
  {
    id: 'code-parsing',
    name: 'Code Date Parsing',
    description: 'Parsing PMO number, date, and time from extracted text',
  },
  {
    id: 'component-validation',
    name: 'Component Validation',
    description: 'Verifying all required code date components are present',
  },
  {
    id: 'date-logic',
    name: 'Date Logic Validation',
    description: 'Checking date validity, freshness, and expiration status',
  },
  {
    id: 'final-decision',
    name: 'Final Decision',
    description: 'Generating pass/fail decision with violation details',
  },
] as const;

export type StepId = typeof AGENT_STEPS[number]['id'];
