import { useEffect, useState } from "react";
import { useLoaderData, useRevalidator } from "react-router";
import { requireAdmin } from "../utils/adminAuth";
import prisma from "../db.server";

export async function loader() {
  const installers = await prisma.installer.findMany({
    orderBy: { createdAt: "desc" },
  });

  return { installers };
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

    es.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.event === "installer.created") {
        // console.log("New installer arrived", data);

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

  // async function toggleStatus(id, current) {
  //   const next = current === "approved" ? "rejected" : "approved";

  //   await fetch("/admin", {
  //     method: "POST",
  //     body: new URLSearchParams({ id, status: next }),
  //   });

  //   setRows((prev) =>
  //     prev.map((r) => (r.id === id ? { ...r, status: next } : r)),
  //   );
  // }

  async function toggleStatusNew(id, nextStatus) {
    await fetch("/admin", {
      method: "POST",
      body: new URLSearchParams({ id, status: nextStatus }),
    });

    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: nextStatus } : r)),
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
              {/* <button
                onClick={() => toggleStatus(i.id, i.status)}
                className={`px-3 py-1 rounded text-white ${
                  i.status === "approved" ? "bg-red-600" : "bg-green-600"
                }`}
              >
                {i.status === "approved" ? "Reject" : "Approve"}
              </button> */}

              <div className="inline-flex rounded overflow-hidden border border-gray-300">
                {/* Approve button */}
                <button
                  onClick={() => toggleStatusNew(i.id, "approved")}
                  disabled={i.status === "approved"}
                  className={`px-4 py-1 text-white text-sm transition
                    ${
                      i.status === "approved"
                        ? "bg-green-700 cursor-not-allowed opacity-60"
                        : "bg-green-600 hover:bg-green-700"
                    }
                  `}
                >
                  Approve
                </button>

                {/* Reject button */}
                <button
                  onClick={() => toggleStatusNew(i.id, "rejected")}
                  disabled={i.status === "rejected"}
                  className={`px-4 py-1 text-white text-sm transition
                    ${
                      i.status === "rejected"
                        ? "bg-red-700 cursor-not-allowed opacity-60"
                        : "bg-red-600 hover:bg-red-700"
                    }
                  `}
                >
                  Reject
                </button>
              </div>

              <a
                href={`/admin/download/${i.id}`}
                className="px-3 py-1 rounded text-white bg-blue-600 hover:bg-blue-700"
              >
                Download Docs
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
