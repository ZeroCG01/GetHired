/**
 * Currency & Number Formatter
 */
export function formatCurrency(
  amount: number,
  currency: string = 'IDR',
  compact: boolean = false
): string {
  if (isNaN(amount)) return '0';

  if (currency === 'IDR') {
    if (compact) {
      if (amount >= 1_000_000_000) {
        return `Rp ${(amount / 1_000_000_000).toFixed(1).replace(/\.0$/, '')} M`;
      }
      if (amount >= 1_000_000) {
        return `Rp ${(amount / 1_000_000).toFixed(1).replace(/\.0$/, '')} jt`;
      }
      if (amount >= 1_000) {
        return `Rp ${(amount / 1_000).toFixed(0)} rb`;
      }
    }
    return `Rp ${amount.toLocaleString('id-ID')}`;
  }

  // USD / Other currencies
  if (currency === 'USD') {
    if (compact) {
      if (amount >= 1_000_000) {
        return `$${(amount / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
      }
      if (amount >= 1_000) {
        return `$${(amount / 1_000).toFixed(0)}k`;
      }
    }
    return `$${amount.toLocaleString('en-US')}`;
  }

  return `${currency} ${amount.toLocaleString()}`;
}

export function formatSalaryRange(
  min?: number | null,
  max?: number | null,
  currency: string = 'IDR',
  compact: boolean = true
): string | null {
  if (!min && !max) return null;

  if (min && max) {
    if (min === max) {
      return formatCurrency(min, currency, compact);
    }
    const formattedMin = formatCurrency(min, currency, compact);
    const formattedMax = formatCurrency(max, currency, compact);
    return `${formattedMin} - ${formattedMax}`;
  }

  if (min && !max) {
    return `>= ${formatCurrency(min, currency, compact)}`;
  }

  if (!min && max) {
    return `<= ${formatCurrency(max, currency, compact)}`;
  }

  return null;
}

/**
 * Format string with thousands separators while typing (e.g., "8000000" -> "8.000.000")
 */
export function formatNumberWithDots(val: string | number): string {
  const numeric = typeof val === 'number' ? val.toString() : val.replace(/\D/g, '');
  if (!numeric) return '';
  return numeric.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function parseNumberFromDots(val: string): number | null {
  const clean = val.replace(/\D/g, '');
  if (!clean) return null;
  const num = parseInt(clean, 10);
  return isNaN(num) ? null : num;
}

/**
 * Date Formatter
 */
export function formatDate(dateString: string, lang: 'id' | 'en' = 'id'): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const locale = lang === 'id' ? 'id-ID' : 'en-US';
    return date.toLocaleDateString(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatRelativeDate(dateString: string, lang: 'id' | 'en' = 'id'): string {
  if (!dateString) return '-';
  try {
    const target = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);

    const diffDays = Math.round((today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return lang === 'id' ? 'Hari ini' : 'Today';
    }
    if (diffDays === 1) {
      return lang === 'id' ? 'Kemarin' : 'Yesterday';
    }
    if (diffDays > 1) {
      return lang === 'id' ? `${diffDays} hari lalu` : `${diffDays}d ago`;
    }
    if (diffDays < 0) {
      const inDays = Math.abs(diffDays);
      return lang === 'id' ? `${inDays} hari lagi` : `In ${inDays}d`;
    }
    return formatDate(dateString, lang);
  } catch {
    return dateString;
  }
}

