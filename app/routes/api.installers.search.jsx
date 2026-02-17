import prisma from "../db.server";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "https://techtron-8435.myshopify.com",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const city = url.searchParams.get("city");
  const postcode = url.searchParams.get("postcode");

  // if (!city) return { success: false, message: "City is required" };
  // if (!postcode) return { success: false, message: "Postcode is required" };
  if (!city || !postcode) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "City and postcode are required",
      }),
      {
        status: 400,
        headers: corsHeaders(),
      },
    );
  }

  const where = {
    status: "approved",
    city,
    ...(postcode && {
      postcode: {
        contains: postcode,
        // mode: "insensitive",
      },
    }),
  };

  const installers = await prisma.installer.findMany({
    where,
    select: {
      fullName: true,
      companyName: true,
      contactPhone: true,
      city: true,
      postcode: true,
      qualifications: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // return {
  //   success: true,
  //   count: installers.length,
  //   installers: installers.map((installer) => ({
  //     name: installer.fullName,
  //     company: installer.companyName,
  //     contact: installer.contactPhone,
  //     serviceAreas: `${installer.city} ${installer.postcode}`,
  //     ozevStatus: "Approved",
  //   })),
  // };
  return new Response(
    JSON.stringify({
      success: true,
      count: installers.length,
      installers: installers.map((i) => ({
        name: i.fullName,
        company: i.companyName,
        contact: i.contactPhone,
        serviceAreas: `${i.city} ${i.postcode}`,
        ozevStatus: "Approved",
      })),
    }),
    {
      headers: {
        ...corsHeaders(),
        "Content-Type": "application/json",
      },
    },
  );
};
