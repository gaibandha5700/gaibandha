export function validateSubmissionText(itemName, message) {
  const normalizedItemName = itemName.trim();
  const normalizedMessage = message.trim();
  return {
    normalizedItemName,
    normalizedMessage,
    itemNameLength: normalizedItemName.length,
    messageLength: normalizedMessage.length,
    itemNameValid: normalizedItemName.length >= 2 && normalizedItemName.length <= 180,
    messageValid: normalizedMessage.length >= 10 && normalizedMessage.length <= 3000,
  };
}
