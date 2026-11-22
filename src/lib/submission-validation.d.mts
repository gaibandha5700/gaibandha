export type SubmissionTextValidation = {
  normalizedItemName: string;
  normalizedMessage: string;
  itemNameLength: number;
  messageLength: number;
  itemNameValid: boolean;
  messageValid: boolean;
};

export function validateSubmissionText(itemName: string, message: string): SubmissionTextValidation;
