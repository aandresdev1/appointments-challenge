// Date and time utilities

export const getCurrentTimestamp = (): string => {
  return new Date().toISOString();
};

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date.getTime());
  result.setDate(result.getDate() + days);
  return result;
};

export const getTTL = (days: number = 30): number => {
  const expirationDate = addDays(new Date(), days);
  return Math.floor(expirationDate.getTime() / 1000); // DynamoDB TTL expects Unix timestamp
};

export const formatDateForMySQL = (date: Date): string => {
  return date.toISOString().slice(0, 19).replace('T', ' ');
};

export const parseISOString = (isoString: string): Date => {
  return new Date(isoString);
};

export const isValidISODate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};

export const getDateRangeForCountry = (countryCode: 'PE' | 'CL'): { start: Date; end: Date } => {
  const now = new Date();
  const maxDays = countryCode === 'PE' ? 30 : 21; // from business rules

  return {
    start: now,
    end: addDays(now, maxDays),
  };
};
