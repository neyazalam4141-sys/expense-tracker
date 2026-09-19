function parseReceiptText(text) {
  const result = {
    amount: null,
    date: null,
    merchant: null
  };

  // Extract Amount (looks for "Total", "Rs", "₹", or numbers with decimal)
  const amountMatch = text.match(/(?:total|amount|rs\.?|₹)\s*[:\-]?\s*(\d+[.,]?\d*)/i);
  if (amountMatch) {
    result.amount = parseFloat(amountMatch[1].replace(',', ''));
  } else {
    // Fallback: find any number pattern like 123.45
    const numberMatch = text.match(/\d+\.\d{2}/);
    if (numberMatch) {
      result.amount = parseFloat(numberMatch[0]);
    }
  }

  // Extract Date (formats like DD/MM/YYYY, DD-MM-YYYY, etc.)
  const dateMatch = text.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);
  if (dateMatch) {
    result.date = dateMatch[1];
  }

  // Extract Merchant Name (usually the first non-empty line of the receipt)
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  if (lines.length > 0) {
    result.merchant = lines[0].trim();
  }

  return result;
}

module.exports = parseReceiptText;