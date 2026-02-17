import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  await authenticate.public.appProxy(request);

  const htmlContent = `
    <style>
        .installer-search-wrapper {
        max-width: 900px;
        margin: 60px auto;
        padding: 40px;
        background: #fff;
        border-radius: 14px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.08);
        font-family: var(--font-body-family, -apple-system, BlinkMacSystemFont, sans-serif);
        }

        .installer-search-wrapper h1 {
        font-size: 28px;
        font-weight: 600;
        margin-bottom: 8px;
        }

        .installer-search-wrapper p {
        color: #6b7280;
        margin-bottom: 28px;
        font-size: 15px;
        }

        .search-form {
        display: grid;
        grid-template-columns: 1fr 1fr auto;
        gap: 12px;
        margin-bottom: 30px;
        }

        input {
        padding: 12px 14px;
        border-radius: 6px;
        border: 1px solid #d1d5db;
        font-size: 14px;
        }

        button {
        padding: 12px 20px;
        border-radius: 6px;
        border: none;
        background: #000;
        color: #fff;
        font-size: 14px;
        cursor: pointer;
        }

        button:hover {
        opacity: 0.9;
        }

        .results {
        display: grid;
        gap: 16px;
        }

        .installer-card {
        border: 1px solid #e5e7eb;
        border-radius: 10px;
        padding: 20px;
        transition: box-shadow 0.2s ease;
        }

        .installer-card:hover {
        box-shadow: 0 6px 18px rgba(0,0,0,0.06);
        }

        .installer-card h3 {
        margin: 0 0 6px;
        font-size: 18px;
        font-weight: 600;
        }

        .installer-card p {
        margin: 4px 0;
        font-size: 14px;
        color: #374151;
        }

        .badge {
        display: inline-block;
        margin-top: 10px;
        padding: 4px 10px;
        font-size: 12px;
        border-radius: 999px;
        background: #dcfce7;
        color: #166534;
        font-weight: 500;
        }

        .empty,
        .loading {
        font-size: 14px;
        color: #6b7280;
        }

        @media (max-width: 640px) {
        .search-form {
            grid-template-columns: 1fr;
        }
        button {
            width: 100%;
        }
        }
    </style>

    <div class="installer-search-wrapper">
        <h1>Find an OZEV Approved Installer</h1>
        <p>Search trusted installers by city and postcode.</p>

        <form id="searchForm" class="search-form">
        <input id="city" placeholder="City (e.g. London)" required />
        <input id="postcode" placeholder="Postcode (e.g. SW1)" required />
        <button type="submit">Search</button>
        </form>

        <div id="results" class="results"></div>
    </div>

    <script>
        const form = document.getElementById("searchForm");
        const results = document.getElementById("results");

        form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const city = document.getElementById("city").value.trim();
        const postcode = document.getElementById("postcode").value.trim();

        results.innerHTML = '<p class="loading">🔎 Searching installers...</p>';

        try {
            const res = await fetch(
            "/apps/techtron/api/installers/search?city=" +
                encodeURIComponent(city) +
                "&postcode=" +
                encodeURIComponent(postcode)
            );

            const data = await res.json();

            if (!data.success || data.count === 0) {
            results.innerHTML =
                '<p class="empty">No installers found for this location.</p>';
            return;
            }

            results.innerHTML = data.installers
            .map(
                (i) => \`
                <div class="installer-card">
                <h3>\${i.company}</h3>
                <p><strong>Installer:</strong> \${i.name}</p>
                <p><strong>Contact:</strong> \${i.contact}</p>
                <p><strong>Service Area:</strong> \${i.serviceAreas}</p>
                <span class="badge">✅ OZEV Approved</span>
                </div>
            \`
            )
            .join("");
        } catch (err) {
            results.innerHTML =
            '<p class="empty">Something went wrong. Please try again.</p>';
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
