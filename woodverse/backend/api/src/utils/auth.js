import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "woodverse-jwt-secret-change-in-production";
const JWT_EXPIRY = "7d";

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}
