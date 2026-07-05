import { randomInt } from "node:crypto";

export const publicIdAlphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

export function createPublicId() {
  let id = "";

  for (let index = 0; index < 8; index += 1) {
    id += publicIdAlphabet[randomInt(publicIdAlphabet.length)];
  }

  return id;
}
