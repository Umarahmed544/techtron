import { generateAdminToken, validateAdmin } from "../utils/adminJwt.server";

export const action = async ({ request }) => {
  const { email, password } = await request.json();

  if (!validateAdmin(email, password)) {
    return new Response(JSON.stringify({ message: "Invalid credentials" }), {
      status: 401,
    });
  }
  console.log("Admin logged in", email, "with password", password);
  const token = generateAdminToken({ role: "admin", email });

  return {
    success: true,
    token,
  };
};
