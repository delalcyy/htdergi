import { randomBytes } from "crypto";

export function generateCoverSerial(): string {
  const year = new Date().getFullYear();
  const random = randomBytes(3).toString("hex").toUpperCase();
  return `HD-${year}-${random}`;
}
