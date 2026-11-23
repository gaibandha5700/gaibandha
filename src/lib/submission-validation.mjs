export function validateSubmissionText(itemName, message) {
  const normalizedItemName = typeof itemName === "string" ? itemName.trim() : "";
  const normalizedMessage = typeof message === "string" ? message.trim() : "";
  const itemNameLength = Array.from(normalizedItemName).length;
  const messageLength = Array.from(normalizedMessage).length;

  return {
    normalizedItemName,
    normalizedMessage,
    itemNameLength,
    messageLength,
    itemNameValid: itemNameLength >= 2 && itemNameLength <= 180,
    messageValid: messageLength >= 10 && messageLength <= 3000,
  };
}
