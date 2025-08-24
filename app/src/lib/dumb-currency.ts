export function dumbCurrency(value: number): string {
  // Get the user's locale, fallback to 'en-US' if not available
  const locale = Intl.DateTimeFormat().resolvedOptions().locale || 'en-US';

  // Extract country code from locale (e.g., 'en-US' -> 'US', 'fil-PH' -> 'PH')
  const countryCode = locale.split('-').pop()?.toUpperCase() || 'US';

  // Map country codes to currencies with more comprehensive coverage
  const currencyMap: Record<string, string> = {
    // Major economies
    US: 'USD',
    PH: 'PHP',
    GB: 'GBP',
    EU: 'EUR',
    DE: 'EUR',
    FR: 'EUR',
    IT: 'EUR',
    ES: 'EUR',
    NL: 'EUR',
    BE: 'EUR',
    AT: 'EUR',
    PT: 'EUR',
    IE: 'EUR',
    FI: 'EUR',
    GR: 'EUR',
    LU: 'EUR',
    MT: 'EUR',
    CY: 'EUR',
    SK: 'EUR',
    SI: 'EUR',
    EE: 'EUR',
    LV: 'EUR',
    LT: 'EUR',
    JP: 'JPY',
    CN: 'CNY',
    IN: 'INR',
    KR: 'KRW',
    CA: 'CAD',
    AU: 'AUD',
    NZ: 'NZD',
    CH: 'CHF',
    SE: 'SEK',
    NO: 'NOK',
    DK: 'DKK',
    BR: 'BRL',
    MX: 'MXN',
    RU: 'RUB',
    ZA: 'ZAR',
    SG: 'SGD',
    HK: 'HKD',
    TH: 'THB',
    MY: 'MYR',
    ID: 'IDR',
    VN: 'VND',
    TR: 'TRY',
    IL: 'ILS',
    AE: 'AED',
    SA: 'SAR',
    EG: 'EGP',
    NG: 'NGN',
    KE: 'KES',
  };

  // Determine currency based on country code, fallback to USD
  const currency = currencyMap[countryCode] || 'USD';

  // Use Intl.NumberFormat for currency formatting
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    // Fallback in case of error
    return `${currency} ${value.toFixed(2)}`;
  }
}
