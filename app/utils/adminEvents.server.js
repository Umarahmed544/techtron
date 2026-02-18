export const adminClients = new Set();

export function validateWebhook(secret) {
  return secret === process.env.WEBHOOK_SECRET;
}

// Notify admin of new installer registration
export async function notifyAdmin(installer) {
  await fetch(process.env.ADMIN_WEBHOOK_URL, {
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
      if (!res.ok) {
        throw new Error(`Webhook failed: ${res.statusText}`);
      }
    })
    .catch((err) => {
      console.error("Admin webhook error:", err);
    });
}
