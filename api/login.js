import { createHmac, timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "paa_report_auth";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function makeToken(password) {
  return createHmac("sha256", password)
    .update("paa-report-internal-v1")
    .digest("hex");
}

function safeEqual(a, b) {
  const aa = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  return aa.length === bb.length && timingSafeEqual(aa, bb);
}

export default function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).send("Method Not Allowed");
  }

  const expected = process.env.REPORT_ACCESS_PASSWORD;
  if (!expected) {
    console.error("REPORT_ACCESS_PASSWORD is not configured.");
    return res.status(500).send("Server configuration error");
  }

  const body = req.body || {};
  const submitted =
    typeof body === "string"
      ? new URLSearchParams(body).get("password") || ""
      : body.password || "";

  if (!safeEqual(submitted, expected)) {
    res.statusCode = 303;
    res.setHeader("Location", "/?error=1");
    return res.end();
  }

  const token = makeToken(expected);
  res.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${MAX_AGE}`
  );
  res.statusCode = 303;
  res.setHeader("Location", "/dashboard");
  return res.end();
}
