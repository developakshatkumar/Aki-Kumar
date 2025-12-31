
export const redactSensitiveInfo = (text: string): string => {
  let redacted = text;

  // Phone numbers
  redacted = redacted.replace(/(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g, '[REDACTED PHONE]');
  
  // Emails
  redacted = redacted.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[REDACTED EMAIL]');
  
  // Dates of birth (rough pattern)
  redacted = redacted.replace(/DOB:?\s?\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/gi, 'DOB: [REDACTED]');
  
  // Addresses (rough pattern)
  redacted = redacted.replace(/\d+\s[A-Z][a-z]+\s(St|Ave|Rd|Blvd|Lane|Way|Dr)/g, '[REDACTED ADDRESS]');

  // ID Numbers (SSN, MRN patterns)
  redacted = redacted.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[REDACTED ID]');
  redacted = redacted.replace(/MRN:?\s?\d+/gi, 'MRN: [REDACTED]');

  return redacted;
};
