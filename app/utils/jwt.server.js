import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET;

export function signAdmin(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: "1d" });
}

export function verifyAdmin(token) {
  return jwt.verify(token, SECRET);
}
