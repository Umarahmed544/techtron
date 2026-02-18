import { useEffect, useState } from "react";
import { useLoaderData, useRevalidator } from "react-router";
import { requireAdmin } from "../utils/adminAuth";
import prisma from "../db.server";

export async function loader() {
  const installers = await prisma.installer.findMany({
    orderBy: { createdAt: "desc" },
  });

  return { installers };
  // return new Response(JSON.stringify({ installers }), {
  //   headers: { "Content-Type": "application/json" },
  // });
}

export async function action({ request }) {
  const formData = await request.formData();

  const id = formData.get("id");
  const status = formData.get("status"); // approved | rejected

  if (!id || !status) {
    return new Response("Bad request", { status: 400 });
  }

  await prisma.installer.update({
    where: { id },
    data: { status },
  });

  return new Response("OK");
}

export default function AdminDashboard() {
  const { installers } = useLoaderData();
  const revalidator = useRevalidator();
  const [rows, setRows] = useState(installers);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (!requireAdmin()) {
      window.location.href = "/admin/login";
      return;
    }
  }, []);

  /* 🔔 SSE LISTENER */
  useEffect(() => {
    const es = new EventSource("/api/admin/events");
    console.log("Connecting to admin SSE...", es);

    es.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Received SSE event:", data);
      if (data.event === "installer.created") {
        console.log("New installer arrived", data);

        setNotification(`🆕 New installer: ${data.installer.fullName}`);

        // optional: auto-clear after 5s
        setTimeout(() => setNotification(null), 5000);

        // 🔄 Re-fetch loader data
        revalidator.revalidate();
      }
    };

    es.onerror = () => {
      console.warn("SSE disconnected");
    };

    return () => es.close();
  }, [revalidator]);

  /* 🔄 Sync state when loader updates */
  useEffect(() => {
    setRows(installers);
  }, [installers]);

  // // Show toast notification for new installers
  // useEffect(() => {
  //   const es = new EventSource("/admin/events");

  //   es.addEventListener("installer.created", (e) => {
  //     const installer = JSON.parse(e.data);

  //     setNotification(
  //       `🆕 New installer: ${installer.fullName} (${installer.city})`,
  //     );

  //     // optional: auto-clear after 5s
  //     setTimeout(() => setNotification(null), 5000);

  //     // optional: refresh list instantly
  //     window.location.reload();
  //   });

  //   return () => es.close();
  // }, []);

  async function toggleStatus(id, current) {
    const next = current === "approved" ? "rejected" : "approved";

    await fetch("/admin", {
      method: "POST",
      body: new URLSearchParams({ id, status: next }),
    });

    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: next } : r)),
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-3 rounded shadow-lg animate-pulse">
          {notification}
        </div>
      )}

      <h1 className="text-2xl font-semibold mb-6">Installer Registrations</h1>

      <div className="bg-white rounded shadow divide-y">
        {rows.map((i) => (
          <div key={i.id} className="p-4 flex items-center justify-between">
            <div>
              <p className="font-medium">{i.fullName}</p>
              <p className="text-sm text-gray-500">
                {i.companyName} • {i.status}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleStatus(i.id, i.status)}
                className={`px-3 py-1 rounded text-white ${
                  i.status === "approved" ? "bg-red-600" : "bg-green-600"
                }`}
              >
                {i.status === "approved" ? "Reject" : "Approve"}
              </button>
              {/* <button
                onClick={() => toggleStatus(i.id, i.status)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200
                  ${i.status === "approved" ? "bg-green-600" : "bg-gray-300"}
                `}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200
                    ${i.status === "approved" ? "translate-x-5" : "translate-x-1"}
                  `}
                />
              </button> */}

              <a
                href={`/admin/download/${i.id}`}
                className="px-3 py-1 rounded text-white bg-blue-600 hover:bg-blue-700"
              >
                Download Docs
              </a>
              {/* <a href={`/api/admin/download/${i.id}/edition18`}>18th Cert</a>{" "}
              <a href={`/api/admin/download/${i.id}/ozev`}>OZEV</a>{" "}
              <a href={`/api/admin/download/${i.id}/insurance`}>Insurance</a> */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
