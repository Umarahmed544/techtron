import fs from "fs";
import path from "path";
import { requireAdminJwt } from "../utils/adminJwt.server";

export const loader = async ({ request, params }) => {
  requireAdminJwt(request);

  const { id, type } = params;

  const filePath = path.join(
    path.resolve(),
    "public",
    "uploads",
    `${id}_${type}.pdf`
  );

  if (!fs.existsSync(filePath)) {
    throw new Response("File not found", { status: 404 });
  }

  return new Response(fs.createReadStream(filePath), {
    headers: {
      "Content-Type": "application/pdf",
    },
  });
};
