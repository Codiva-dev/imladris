import { randomBytes } from "node:crypto";

/** Token opaco para el enlace permanente de unión. */
export function newJoinToken() {
  return randomBytes(24).toString("base64url");
}
