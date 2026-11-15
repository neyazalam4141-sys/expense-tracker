const MONTHS = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12
};

function pad(n) {
  return String(n).padStart(2, '0');
}

function extractNumber(line) {
  const matches = line.match(/\d[\d,]*\.?\d*/g);
  if (!matches) return null;
  const value = parseFloat(matches[matches.length - 1].replace(/,/g, ''));
  return isNaN(value) ? null : value;
}

function findAmount(lines, text) {
  const keywords = ['grand total', 'net payable', 'net amount', 'amount payable', 'total amount', 'total'];
  for (const keyword of keywords) {
    for (const line of lines) {
      const cleaned = line.toLowerCase().replace(/sub\s*-?\s*total/g, '');
      if (cleaned.includes(keyword)) {
        const value = extractNumber(line);
        if (value) return value;
      }
    }
  }
  const decimals = (text.match(/\d+\.\d{2}\b/g) || []).map(parseFloat);
  return decimals.length ? Math.max(...decimals) : null;
}

function matchDate(str) {
  // Format like 17 Jun 2026 or 17-Jun-26
  const named = str.match(/(?<![\w\/\-])(\d{1,2})[\s\-\/.]+([A-Za-z]{3,9})[\s\-\/.,]+(\d{2,4})(?!\d)/);
  if (named) {
    const month = MONTHS[named[2].slice(0, 3).toLowerCase()];
    if (month) {
      let year = parseInt(named[3], 10);
      if (year < 100) year += 2000;
      return `${pad(named[1])}/${pad(month)}/${year}`;
    }
  }

  // Format like 17/06/2026 or 17-06-26
  const numeric = str.match(/(?<![\w\/\-.])(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4}|\d{2})(?![\w\/\-])/);
  if (numeric) {
    let year = parseInt(numeric[3], 10);
    if (year < 100) year += 2000;
    return `${pad(numeric[1])}/${pad(numeric[2])}/${year}`;
  }

  return null;
}

function findDate(lines, text) {
  for (const line of lines) {
    if (/date/i.test(line)) {
      const found = matchDate(line);
      if (found) return found;
    }
  }
  return matchDate(text);
}

function findMerchant(lines) {
  const skip = /^(tax invoice|invoice|bill|receipt|cash memo|welcome|gstin|ph|phone|tel)\b/i;
  for (const line of lines) {
    const letters = (line.match(/[A-Za-z]/g) || []).length;
    if (letters >= 3 && !skip.test(line)) return line;
  }
  return null;
}

function parseReceiptText(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  return {
    amount: findAmount(lines, text),
    date: findDate(lines, text),
    merchant: findMerchant(lines)
  };
}

module.exports = parseReceiptText;