import prisma from "../db.server";
import fs from "fs/promises";
import path from "path";
import { cwd } from "node:process";
import { Buffer } from "buffer";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/jpg"];

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://techtron-8435.myshopify.com",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const action = async ({ request }) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (request.headers.get("sec-fetch-dest") === "document") {
    throw new Response("Forbidden", { status: 403 });
  }

  if (request.method !== "POST") {
    return new Response(JSON.stringify({ message: "Method not allowed" }), {
      status: 405,
      headers: corsHeaders,
    });
  }

  // ✅ Guard Content-Type
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("multipart/form-data")) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "Invalid Content-Type. Use multipart/form-data.",
      }),
      { status: 415, headers: corsHeaders },
    );
  }

  const formData = await request.formData();

  // Text fields
  const fullName = formData.get("fullName");
  const companyName = formData.get("companyName");
  const email = formData.get("email");
  const phone = formData.get("phone");
  const city = formData.get("city");
  const postcode = formData.get("postcode");
  const qualifications = formData.get("qualifications");

  // Files
  const edition18 = formData.get("edition18");
  const ozevCert = formData.get("ozevCert");
  const insurance = formData.get("insurance");

  // Required validation
  if (
    !fullName ||
    !companyName ||
    !email ||
    !phone ||
    !city ||
    !postcode ||
    !edition18 ||
    !ozevCert ||
    !insurance
  ) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "All fields and documents are required",
      }),
      { status: 400, headers: corsHeaders },
    );
  }

  // File validation helper
  const validateFile = (file) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error(`Invalid file type: ${file.type}`);
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new Error("File size exceeds 10MB");
    }
  };

  try {
    validateFile(edition18);
    validateFile(ozevCert);
    validateFile(insurance);
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, message: err.message }),
      { status: 400, headers: corsHeaders },
    );
  }

  // 1️⃣ Create installer first (to get ID)
  const installer = await prisma.installer.create({
    data: {
      fullName: fullName.toString(),
      companyName: companyName.toString(),
      contactEmail: email.toString(),
      contactPhone: phone.toString(),
      city: city.toString(),
      postcode: postcode.toString(),
      qualifications: qualifications?.toString(),
      status: "pending",
    },
  });

  // 2️⃣ Prepare upload directory
  const uploadDir = path.join(cwd(), "public", "uploads", installer.id);

  await fs.mkdir(uploadDir, { recursive: true });

  // 3️⃣ Save files
  const saveFile = async (file, filename) => {
    const buffer = Buffer.from(await file.arrayBuffer());
    const filePath = path.join(uploadDir, `${filename}.${file.type.split("/")[1]}`);
    await fs.writeFile(filePath, buffer);
    return `/uploads/${installer.id}/${filename}.${file.type.split("/")[1]}`;
  };

  const certificateUrls = {
    edition18: await saveFile(edition18, "edition18"),
    ozev: await saveFile(ozevCert, "ozev"),
    insurance: await saveFile(insurance, "insurance"),
  };

  // 4️⃣ Update installer with certificate URLs
  await prisma.installer.update({
    where: { id: installer.id },
    data: {
      certificateUrls: JSON.stringify(certificateUrls),
    },
  });

  return new Response(
    JSON.stringify({
      success: true,
      message: "Installer registered successfully. Awaiting admin approval.",
      installerId: installer.id,
    }),
    { status: 201, headers: corsHeaders },
  );
};
