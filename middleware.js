import { next } from "@vercel/functions";
import { createHmac, timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "pa_client_report_auth";
const DEFAULT_CLIENT_ID = "client";
const REPORT_PATH = "/lullaboy-pr-aug2026";

export const config = {
  matcher: ["/", "/lullaboy-pr-aug2026"],
  runtime: "nodejs"
};

function makeToken(clientId, password) {
  return createHmac("sha256", password)
    .update(`pa-client-report-v2:${clientId}`)
    .digest("hex");
}

function getCookie(header, name) {
  if (!header) return "";
  for (const part of header.split(";")) {
    const index = part.indexOf("=");
    if (index < 0) continue;
    if (part.slice(0, index).trim() === name) {
      return decodeURIComponent(part.slice(index + 1).trim());
    }
  }
  return "";
}

function safeEqual(a, b) {
  const aa = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  return aa.length === bb.length && timingSafeEqual(aa, bb);
}

export default function middleware(request) {
  const password = process.env.REPORT_ACCESS_PASSWORD;
  if (!password) return new Response("Server configuration error", { status: 500 });

  const clientId = (process.env.REPORT_ACCESS_ID || DEFAULT_CLIENT_ID).trim().toLowerCase();
  const actual = getCookie(request.headers.get("cookie"), COOKIE_NAME);
  const authenticated = actual && safeEqual(actual, makeToken(clientId, password));
  const pathname = new URL(request.url).pathname;

  if (pathname === "/" && authenticated) {
    return Response.redirect(new URL(REPORT_PATH, request.url), 302);
  }
  if (pathname === REPORT_PATH && !authenticated) {
    return Response.redirect(new URL("/", request.url), 302);
  }
  return next();
}
