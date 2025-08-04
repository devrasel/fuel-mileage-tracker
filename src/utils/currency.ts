interface Settings {
  currency: string;
  dateFormat: string;
  distanceUnit: string;
  volumeUnit: string;
  entriesPerPage: number;
  timezone?: string;
}

// Use consistent locale to avoid hydration mismatches
const SAFE_LOCALE = 'en-US';

export const formatCurrency = (amount: number | null | undefined, settings?: Settings) => {
  if (amount === null || amount === undefined || isNaN(amount) || !isFinite(amount)) {
    return getCurrencySymbol(settings?.currency || 'BDT') + '0.00';
  }

  const currency = settings?.currency || 'BDT';
  
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return getCurrencySymbol(currency) + amount.toFixed(2);
  }
};

export const getCurrencySymbol = (currency: string) => {
  const symbols: { [key: string]: string } = {
    BDT: '৳',
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CAD: 'C$',
    AUD: 'A$',
  };
  return symbols[currency] || '৳';
};