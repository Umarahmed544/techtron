// import { adminClients, validateWebhook } from "../utils/adminEvents.server";

// export const action = async ({ request }) => {
//   const secret = request.headers.get("x-techtron-secret");
//   console.log("Received admin event with secret:", secret);
//   if (!validateWebhook(secret)) {
//     console.warn("Unauthorized admin event attempt");
//     return new Response("Unauthorized", { status: 401 });
//   }

//   const payload = await request.json();
//   console.log("Admin event payload:", payload);

//   // 🔔 Push event to all connected admins
//   adminClients.forEach((send) => {
//     console.log("Sending event to admin client:", payload);
//     send(payload);
//   });

//   console.log("Event sent to all admin clients");
//   return new Response(JSON.stringify({ success: true }), { status: 200 });
// };

import { broadcast } from "../../admin.events";
import { validateWebhook } from "../utils/adminEvents.server";

export async function action({ request }) {
  const secret = request.headers.get("x-techtron-secret");
  if (!validateWebhook(secret)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const payload = await request.json();

  if (payload.event === "installer.created") {
    broadcast("installer.created", payload.installer);
  }

  return new Response("OK");
}
