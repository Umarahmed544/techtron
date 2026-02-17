// import { useEffect, useState } from "react";

// export default function AdminPanel() {
//   const [installers, setInstallers] = useState([]);

//   useEffect(() => {
//     const token = localStorage.getItem("admin_token");

//     if (!token) {
//       window.location.href = "/admin/login";
//       return;
//     }

//     fetch("/api/admin/installers", {
//       headers: { Authorization: `Bearer ${token}` },
//     })
//       .then(res => {
//         if (res.status === 401) {
//           localStorage.removeItem("admin_token");
//           window.location.href = "/admin/login";
//           return;
//         }
//         return res.json();
//       })
//       .then(setInstallers);
//   }, []);

//   async function updateStatus(id, status) {
//     const token = localStorage.getItem("admin_token");

//     await fetch(`/api/admin/installers/${id}`, {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ status }),
//     });

//     setInstallers(prev =>
//       prev.map(i =>
//         i.id === id ? { ...i, status } : i
//       )
//     );
//   }

//   return (
//     <div>
//       <h1>Installer Registrations</h1>

//       {installers.map(i => (
//         <div key={i.id} style={{ borderBottom: "1px solid #ccc" }}>
//           <strong>{i.fullName}</strong> — {i.status}

//           <br />

//           <button onClick={() => updateStatus(i.id, "approved")}>
//             Approve
//           </button>

//           <button onClick={() => updateStatus(i.id, "rejected")}>
//             Reject
//           </button>

//           <br />

//           <a href={`/api/admin/download/${i.id}/edition18`}>18th Cert</a>{" "}
//           <a href={`/api/admin/download/${i.id}/ozev`}>OZEV</a>{" "}
//           <a href={`/api/admin/download/${i.id}/insurance`}>Insurance</a>
//         </div>
//       ))}
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import { useLoaderData } from "react-router";
import { requireAdmin } from "../utils/adminAuth";
import prisma from "../db.server";

export async function loader() {
  const installers = await prisma.installer.findMany({
    orderBy: { createdAt: "desc" },
  });

  return new Response(JSON.stringify({ installers }), {
    headers: { "Content-Type": "application/json" },
  });
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
  const [rows, setRows] = useState(installers);

  useEffect(() => {
    if (!requireAdmin()) {
      window.location.href = "/admin/login";
      return;
    }
  }, []);

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
