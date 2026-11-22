export type SubmissionApiTextValidation = {
  normalizedItemName: string;
  normalizedMessage: string;
  itemNameLength: number;
  messageLength: number;
  itemNameValid: boolean;
  messageValid: boolean;
};

export function validateSubmissionTextForApi(
  itemName: unknown,
  message: unknown,
): SubmissionApiTextValidation;
