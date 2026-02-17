import { useNavigate } from "react-router";
import { useState } from "react";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const email = e.target.email.value;
    const password = e.target.password.value;

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      setError("Invalid credentials");
      return;
    }

    const data = await res.json();
    localStorage.setItem("admin_token", data.token);
    navigate("/admin");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow w-full max-w-md">
        <h1 className="text-2xl font-semibold mb-6 text-center">Admin Login</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="email"
            placeholder="Email"
            className="w-full border rounded px-3 py-2"
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            className="w-full border rounded px-3 py-2"
          />

          <button className="w-full bg-black text-white py-2 rounded">
            Login
          </button>
        </form>

        {error && <p className="text-red-600">{error}</p>}
      </div>
    </div>
  );
}

// import { Form, useActionData } from "react-router";
// // import { json, redirect } from "react-router";
// import jwt from "jsonwebtoken";

// export async function action({ request }) {
//   const formData = await request.formData();
//   console.log("formData logged in", formData);

//   const email = formData.get("email");
//   const password = formData.get("password");

//   if (email !== "admin@example.com" || password !== "secret") {
//     console.log("email logged in", email, "passsword logged in", password);

//     console.log("Admin logged in", import.meta.env.VITE_JWT_SECRET);
//     const error = JSON.stringify({ error: "Invalid credentials", status: 401 });
//     console.log("Admin error in", error);

//     return new Response(JSON.stringify({ error: "Invalid credentials" }), {
//       status: 401,
//       headers: { "Content-Type": "application/json" },
//     });

//     // return JSON.stringify({ error: "Invalid credentials" }, { status: 401 });
//   }

//   console.log("Admin logged in", import.meta.env.VITE_JWT_SECRET);
//   const token = jwt.sign(
//     { email, role: "admin" },
//     import.meta.env.VITE_JWT_SECRET,
//     { expiresIn: "1d" },
//   );

//   // return { token };
//   return new Response(JSON.stringify({ token }), {
//     headers: { "Content-Type": "application/json" },
//   });
// }

// export default function AdminLogin() {
//   const data = useActionData();

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100">
//       <div className="bg-white p-8 rounded-xl shadow w-full max-w-md">
//         <h1 className="text-2xl font-semibold mb-6 text-center">Admin Login</h1>

//         {data?.error && <p className="text-red-600 mb-4">{data.error}</p>}

//         <Form
//           method="post"
//           onSubmit={async (e) => {
//             e.preventDefault();
//             const res = await fetch("/admin/login", {
//               method: "POST",
//               body: new FormData(e.target),
//             });
//             const data = await res.json().catch(() => null);

//             if (!res.ok) {
//               alert(data?.error || "Login failed");
//               return;
//             }
//             if (data?.token) {
//               localStorage.setItem("admin_token", data.token);
//               window.location.href = "/admin";
//             }
//           }}
//           className="space-y-4"
//         >
//           <input
//             name="email"
//             placeholder="Email"
//             className="w-full border rounded px-3 py-2"
//           />
//           <input
//             name="password"
//             type="password"
//             placeholder="Password"
//             className="w-full border rounded px-3 py-2"
//           />
//           <button className="w-full bg-black text-white py-2 rounded">
//             Login
//           </button>
//         </Form>
//       </div>
//     </div>
//   );
// }
