import prisma from "../db.server";
import { requireAdminJwt } from "../utils/adminJwt.server";

export const loader = async ({ request }) => {
  requireAdminJwt(request);

  const installers = await prisma.installer.findMany({
    orderBy: { createdAt: "desc" },
  });

  return installers;
};
