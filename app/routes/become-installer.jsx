import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  await authenticate.public.appProxy(request);

  const htmlContent = `
    <style>
        .techtron-wrapper {
            max-width: 720px;
            margin: 60px auto;
            padding: 40px;
            background: #ffffff;
            border-radius: 14px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
            font-family: var(--font-body-family, -apple-system, BlinkMacSystemFont, sans-serif);
        }

        .techtron-wrapper h1 {
            font-size: 28px;
            margin-bottom: 8px;
            font-weight: 600;
        }

        .techtron-wrapper p {
            color: #6b7280;
            margin-bottom: 28px;
            font-size: 15px;
        }

        .grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
        }

        input,
        textarea {
            width: 100%;
            padding: 12px 14px;
            border-radius: 6px;
            border: 1px solid #d1d5db;
            font-size: 14px;
        }

        textarea {
            grid-column: span 2;
            min-height: 90px;
        }

        label {
            font-size: 14px;
            font-weight: 500;
            display: block;
        }

        .file-group {
            margin-top: 24px;
            display: grid;
            gap: 16px;
        }

        button {
            margin-top: 32px;
            width: 100%;
            background: #000;
            color: #fff;
            padding: 14px;
            font-size: 15px;
            border-radius: 6px;
            border: none;
            cursor: pointer;
        }

        button:hover {
            opacity: 0.9;
        }

        .message {
            margin-top: 16px;
            font-size: 14px;
        }

        @media (max-width: 640px) {
            .grid {
            grid-template-columns: 1fr;
            }

            textarea {
            grid-column: span 1;
            }
        }
    </style>

    <div class="techtron-wrapper">
        <h1>Become an Approved Installer</h1>
        <p>Submit your details to register as an installer.</p>

        <form id="installerForm" enctype="multipart/form-data">
            <div class="grid">
            <input name="fullName" placeholder="Full Name" required />
            <input name="companyName" placeholder="Company Name" required />
            <input type="email" name="email" placeholder="Email" required />
            <input name="phone" placeholder="Phone Number" required />
            <input name="city" placeholder="City" required />
            <input name="postcode" placeholder="Postcode" required />
            <textarea name="qualifications" placeholder="Qualifications (optional)"></textarea>
            </div>

            <div class="file-group">
            <label>
                Edition 18 Certificate
                <input type="file" name="edition18" required />
            </label>

            <label>
                OZEV Certificate
                <input type="file" name="ozevCert" required />
            </label>

            <label>
                Insurance Document
                <input type="file" name="insurance" required />
            </label>
            </div>

            <button type="submit">Register as Installer</button>
            <p class="message" id="formMessage"></p>
        </form>
    </div>

    <script>
        const form = document.getElementById("installerForm");
        const message = document.getElementById("formMessage");

        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            message.textContent = "⏳ Submitting...";

            const formData = new FormData(form);

            try {
            const res = await fetch("/apps/techtron/api/installers/register", {
                method: "POST",
                body: formData
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Registration failed");

            message.textContent = "✅ Registration submitted successfully!";
            form.reset();
            } catch (err) {
            message.textContent = "❌ " + err.message;
            }
        });
    </script>
  `;

  return new Response(htmlContent, {
    headers: {
      "Content-Type": "application/liquid",
    },
  });
};
