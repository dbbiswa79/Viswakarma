export function formatCurrency(amount: number, symbol = '₹'): string {
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(amount || 0);
  return `${symbol}${formatted}`;
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(isoString: string): string {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

// Convert amount to Indian English words for formal receipts
export function amountToWords(num: number, currencyName = 'Rupees'): string {
  if (!num || isNaN(num) || num <= 0) return `Zero ${currencyName} Only`;

  const a = [
    '',
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen',
  ];
  const b = [
    '',
    '',
    'Twenty',
    'Thirty',
    'Forty',
    'Fifty',
    'Sixty',
    'Seventy',
    'Eighty',
    'Ninety',
  ];

  function convertGroup(n: number): string {
    let output = '';
    if (n > 99) {
      output += a[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n > 19) {
      output += b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : '');
    } else if (n > 0) {
      output += a[n];
    }
    return output.trim();
  }

  const crores = Math.floor(num / 10000000);
  num %= 10000000;
  const lakhs = Math.floor(num / 100000);
  num %= 100000;
  const thousands = Math.floor(num / 1000);
  num %= 1000;
  const remainder = Math.floor(num);

  const parts: string[] = [];
  if (crores > 0) parts.push(convertGroup(crores) + ' Crore');
  if (lakhs > 0) parts.push(convertGroup(lakhs) + ' Lakh');
  if (thousands > 0) parts.push(convertGroup(thousands) + ' Thousand');
  if (remainder > 0) parts.push(convertGroup(remainder));

  const result = parts.join(' ').trim();
  return `${result} ${currencyName} Only`;
}
