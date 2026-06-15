import { randomBytes } from "crypto";

export function generateCoverSerial(): string {
  const year = new Date().getFullYear();
  const random = randomBytes(3).toString("hex").toUpperCase();
  return `HD-${year}-${random}`;
}

/* EAN-13 formatında kullanıcıya özgü kalıcı seri numarası üret */
export function generateUserSerial(): string {
  const digits = Array.from({ length: 12 }, () => Math.floor(Math.random() * 10));
  const sum = digits.reduce((acc, d, i) => acc + (i % 2 === 0 ? d : d * 3), 0);
  const check = (10 - (sum % 10)) % 10;
  return [...digits, check].join("");
}
