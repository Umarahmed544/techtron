// import fs from "fs/promises";
import fs from "fs";
import path from "path";
import archiver from "archiver";

export async function loader({ request, params }) {
  console.log("Loader called with request:", request);
  const installerId = params.id;
  const uploadsDir = path.resolve("public/uploads", installerId);

  const files = [
    { name: "edition18.pdf", label: "18th-edition.pdf" },
    { name: "insurance.pdf", label: "insurance.pdf" },
    { name: "ozev.pdf", label: "ozev.pdf" },
  ];

  const archive = archiver("zip", { zlib: { level: 9 } });

  const stream = new ReadableStream({
    start(controller) {
      archive.on("data", (chunk) => controller.enqueue(chunk));
      archive.on("end", () => controller.close());
      archive.on("error", (err) => controller.error(err));

      for (const file of files) {
        const filePath = path.join(uploadsDir, file.name);
        if (fs.existsSync(filePath)) {
          archive.file(filePath, { name: file.label });
        }
      }

      archive.finalize();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="installer-${installerId}-documents.zip"`,
    },
  });
}
