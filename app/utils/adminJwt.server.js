import jwt from "jsonwebtoken";

export function generateAdminToken(payload) {
  console.log("Generating admin token with payload:", payload);
  console.log("Generating admin token with payload22:", process.env.VITE_JWT_SECRET);
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
