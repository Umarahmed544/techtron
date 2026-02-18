import { adminClients, validateWebhook } from "../utils/adminEvents.server";

export const action = async ({ request }) => {
  const secret = request.headers.get("x-techtron-secret");
  if (!validateWebhook(secret)) {
    console.warn("Unauthorized admin event attempt");
    return new Response("Unauthorized", { status: 401 });
  }
  const payload = await request.json();

  // 🔔 Push event to all connected admins
  adminClients.forEach((send) => {
    send(payload);
  });

  return new Response(JSON.stringify({ success: true }), { status: 200 });
};