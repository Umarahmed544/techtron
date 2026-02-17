import prisma from "../db.server";
import { requireAdminJwt } from "../utils/adminJwt.server";

export const action = async ({ request, params }) => {
  requireAdminJwt(request);

  const { status } = await request.json();

  if (!["approved", "rejected"].includes(status)) {
    return new Response("Invalid status", { status: 400 });
  }

  await prisma.installer.update({
    where: { id: params.id },
    data: { status },
  });

  return { success: true };
};
