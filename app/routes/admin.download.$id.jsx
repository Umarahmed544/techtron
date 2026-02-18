import fs from "fs";
import path from "path";
import archiver from "archiver";
import { PassThrough } from "stream";

export async function loader({ params }) {
  const installerId = params.id;
  const uploadsDir = path.resolve("public/uploads", installerId);

  // Document base names + output labels
  const documents = [
    { base: "edition18", label: "18th-edition" },
    { base: "insurance", label: "insurance" },
    { base: "ozev", label: "ozev" },
  ];

  // Supported extensions (order matters → priority)
  const extensions = [".pdf", ".jpg", ".jpeg", ".png"];

  const archive = archiver("zip", { zlib: { level: 9 } });
  const passThrough = new PassThrough();

  archive.pipe(passThrough);

  const stream = new ReadableStream({
    start(controller) {
      passThrough.on("data", (chunk) => controller.enqueue(chunk));
      passThrough.on("end", () => controller.close());
      passThrough.on("error", (err) => controller.error(err));
    },
  });

  let fileAdded = false;

  for (const doc of documents) {
    for (const ext of extensions) {
      const filePath = path.join(uploadsDir, `${doc.base}${ext}`);

      if (fs.existsSync(filePath)) {
        archive.file(filePath, {
          name: `${doc.label}${ext}`, // keep correct extension
        });
        fileAdded = true;
        break; // stop after first match
      }
    }
  }

  if (!fileAdded) {
    throw new Response("No documents found", { status: 404 });
  }

  await archive.finalize();

  return new Response(stream, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="installer-${installerId}-documents.zip"`,
    },
  });
}
