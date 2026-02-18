import jwt from "jsonwebtoken";

export function generateAdminToken(payload) {
  return jwt.sign(payload, process.env.VITE_JWT_SECRET, {
    expiresIn: "1h",
  });
}

export function requireAdminJwt(request) {
  const auth = request.headers.get("authorization");

  if (!auth || !auth.startsWith("Bearer ")) {
    throw new Response("Unauthorized", { status: 401 });
  }

  const token = auth.replace("Bearer ", "");

  try {
    return jwt.verify(token, process.env.VITE_JWT_SECRET);
  } catch {
    throw new Response("Invalid token", { status: 401 });
  }
}

export function validateAdmin(email, password) {
  return (
    email === process.env.VITE_ADMIN_EMAIL &&
    password === process.env.VITE_ADMIN_PASSWORD
  );
}
