import { next } from "@vercel/functions";
import { createHmac, timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "paa_report_auth";

export const config = {
  // Only the internal portal is protected.
  // Client report URLs such as /lullaboy-pr-aug2026 bypass middleware.
  matcher: ["/", "/dashboard"],
  runtime: "nodejs"
};

function makeToken(password) {
  return createHmac("sha256", password)
    .update("paa-report-internal-v1")
    .digest("hex");
}

function getCookie(header, name) {
  if (!header) return "";
  for (const part of header.split(";")) {
    const i = part.indexOf("=");
    if (i < 0) continue;
    const key = part.slice(0, i).trim();
    if (key === name) return decodeURIComponent(part.slice(i + 1).trim());
  }
  return "";
}

function safeEqual(a, b) {
  const aa = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  return aa.length === bb.length && timingSafeEqual(aa, bb);
}

export default function middleware(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  const password = process.env.REPORT_ACCESS_PASSWORD;
  if (!password) {
    return new Response("Server configuration error", { status: 500 });
  }

  const actual = getCookie(request.headers.get("cookie"), COOKIE_NAME);
  const expected = makeToken(password);
  const authenticated = actual && safeEqual(actual, expected);

  if (pathname === "/") {
    if (authenticated) {
      return Response.redirect(new URL("/dashboard", request.url), 302);
    }
    return next();
  }

  if (pathname === "/dashboard") {
    if (!authenticated) {
      return Response.redirect(new URL("/", request.url), 302);
    }
    return next();
  }

  return next();
}
