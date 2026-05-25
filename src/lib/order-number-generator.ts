/**
 * Generate a unique order number using timestamp and random suffix
 * Format: ORD-{timestamp}-{random3digits}
 * @returns Unique order number string
 */
function generateTimestampOrder() {
  const timestamp = Date.now().toString(); // Get current timestamp
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `ORD-${timestamp}-${random}`;
}

export { generateTimestampOrder };
