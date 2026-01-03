import { randomBytes } from 'crypto';

// Generate secure random password
export function generateSystemPassword(length: number = 12): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  
  // Ensure at least one character from each category
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*';
  
  password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
  password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
  password += numbers.charAt(Math.floor(Math.random() * numbers.length));
  password += special.charAt(Math.floor(Math.random() * special.length));
  
  // Fill the rest with random characters
  for (let i = 4; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

// Generate Login ID: [Company][First2LettersFirstName][First2LettersLastName][Year][Serial]
export function generateLoginId(
  companyName: string, 
  firstName: string, 
  lastName: string, 
  joiningYear: number, 
  serialNumber: number
): string {
  const companyInitials = companyName
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2)
    .padEnd(2, 'X');
  
  const namePart = (
    firstName.substring(0, 2).toUpperCase() +
    lastName.substring(0, 2).toUpperCase()
  ).padEnd(4, 'X');
  
  const yearPart = joiningYear.toString();
  const serialPart = String(serialNumber).padStart(4, '0');
  
  return `${companyInitials}${namePart}${yearPart}${serialPart}`;
}

// Extract name parts from full name
export function extractNameParts(fullName: string): { firstName: string; lastName: string } {
  const nameParts = fullName.trim().split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || nameParts[0] || '';
  
  return { firstName, lastName };
}
