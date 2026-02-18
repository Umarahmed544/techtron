export const adminClients = new Set();

export function validateWebhook(secret) {
  return secret === process.env.WEBHOOK_SECRET;
}

// Notify admin of new installer registration
export async function notifyAdmin(installer) {
  console.log("Notifying admin of new installer:", installer.id);
  console.log("process.env.ADMIN_WEBHOOK_URL:", process.env.ADMIN_WEBHOOK_URL);
  await fetch("https://oasis-beverly-rpg-inspired.trycloudflare.com/api/admin/webhooks/installer", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-techtron-secret": process.env.WEBHOOK_SECRET,
    },
    body: JSON.stringify({
      event: "installer.created",
      installer: {
        id: installer.id,
        fullName: installer.fullName,
        companyName: installer.companyName,
        city: installer.city,
        postcode: installer.postcode,
        status: installer.status,
        createdAt: new Date().toISOString(),
      },
    }),
  })
    .then((res) => {
      console.log("Admin webhook response:", res.status);
      if (!res.ok) {
        throw new Error(`Webhook failed: ${res.statusText}`);
      }
    })
    .catch((err) => {
      console.error("Admin webhook error:", err);
    });
}
