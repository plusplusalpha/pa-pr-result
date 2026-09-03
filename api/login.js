import { createHmac, timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "pa_client_report_auth";
const MAX_AGE = 60 * 60 * 24 * 7;
const DEFAULT_CLIENT_ID = "client";
const REPORT_PATH = "/lullaboy-pr-aug2026";

function makeToken(clientId, password) {
  return createHmac("sha256", password)
    .update(`pa-client-report-v2:${clientId}`)
    .digest("hex");
}

function safeEqual(a, b) {
  const aa = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  return aa.length === bb.length && timingSafeEqual(aa, bb);
}

function getFormValue(body, key) {
  if (typeof body === "string") return new URLSearchParams(body).get(key) || "";
  return body?.[key] || "";
}

export default function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).send("Method Not Allowed");
  }

  const expectedId = (process.env.REPORT_ACCESS_ID || DEFAULT_CLIENT_ID).trim().toLowerCase();
  const expectedPassword = process.env.REPORT_ACCESS_PASSWORD;

  if (!expectedPassword) {
    console.error("REPORT_ACCESS_PASSWORD is not configured.");
    return res.status(500).send("Server configuration error");
  }

  const submittedId = getFormValue(req.body, "clientId").trim().toLowerCase();
  const submittedPassword = getFormValue(req.body, "password");

  if (!safeEqual(submittedId, expectedId) || !safeEqual(submittedPassword, expectedPassword)) {
    res.statusCode = 303;
    res.setHeader("Location", "/?error=1");
    return res.end();
  }

  const token = makeToken(expectedId, expectedPassword);
  res.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${MAX_AGE}`
  );
  res.statusCode = 303;
  res.setHeader("Location", REPORT_PATH);
  return res.end();
}
