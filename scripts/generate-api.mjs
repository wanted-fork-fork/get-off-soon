#!/usr/bin/env node

/**
 * Swagger JSON → TypeScript API 함수 코드 생성 스크립트
 *
 * 실행: node scripts/generate-api.mjs
 * 출력: src/api/generated.ts
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "..");
const OUTPUT_DIR = join(PROJECT_ROOT, "src", "api");
const OUTPUT_FILE = join(OUTPUT_DIR, "generated.ts");

const SWAGGER_URL =
  "https://xmwkr6zd97.execute-api.ap-northeast-2.amazonaws.com/documentation/json";

const SKIP_PATHS = ["/documentation/json", "/documentation/yaml", "/health"];
const SKIP_TAGS = ["어드민"];

// ─── OpenAPI JSON → TS type string ────────────────────────────
function schemaToTs(schema, indent = 2) {
  if (!schema) return "unknown";

  if (schema.oneOf) {
    return schema.oneOf.map((s) => schemaToTs(s, indent)).join(" | ");
  }

  if (schema.type === "null") return "null";

  if (schema.type === "array") {
    const items = schemaToTs(schema.items, indent);
    return items.includes("|") || items.includes("{")
      ? `Array<${items}>`
      : `${items}[]`;
  }

  if (schema.type === "object") {
    const props = schema.properties;
    if (!props || Object.keys(props).length === 0) return "Record<string, never>";

    const pad = " ".repeat(indent);
    const lines = Object.entries(props).map(([key, val]) => {
      const optional = schema.required?.includes(key) ? "" : "?";
      const nullable = val.nullable ? " | null" : "";
      return `${pad}${key}${optional}: ${schemaToTs(val, indent + 2)}${nullable};`;
    });
    return `{\n${lines.join("\n")}\n${" ".repeat(indent - 2)}}`;
  }

  if (schema.type === "string") {
    if (schema.enum) return schema.enum.map((v) => `'${v}'`).join(" | ");
    return "string";
  }
  if (schema.type === "number" || schema.type === "integer") return "number";
  if (schema.type === "boolean") return "boolean";

  return "unknown";
}

// ─── 경로+메서드 → 함수 이름 생성 ─────────────────────────────
function buildFunctionName(method, path) {
  const segments = path
    .replace(/^\/api\/v1\//, "")
    .split("/")
    .filter(Boolean);

  const parts = [];
  const verbMap = { get: "get", post: "create", put: "update", patch: "update", delete: "delete" };

  for (const seg of segments) {
    if (seg.startsWith("{") && seg.endsWith("}")) continue;
    parts.push(seg.replace(/-/g, "_"));
  }

  let raw = parts.join("_");

  const prefix = verbMap[method] || method;

  // 특별 케이스 처리
  const specialMappings = {
    "create_auth_login_dev": "devLogin",
    "get_auth_kakao_authorize": "kakaoAuthorize",
    "get_auth_kakao_callback": "kakaoCallback",
    "create_auth_login": "socialLogin",
    "create_auth_refresh": "refreshToken",
    "create_auth_logout": "logout",
    "get_users_me": "getMe",
    "update_users_me": "updateMyName",
    "delete_users_me": "deleteAccount",
    "update_users_me_fcm_token": "updateFcmToken",
    "get_users_me_rewards": "getRewards",
    "create_users_me_checkin": "checkin",
    "create_users_me_ad_reward": "claimAdReward",
    "get_subway_lines": "getSubwayLines",
    "get_subway_lines_trains": "getTrainsByLine",
    "get_subway_lines_stations": "getStationsByLine",
    "get_subway_lines_trains_debug": "getTrainsDebug",
    "get_subway_stations_trains": "getTrainsByStation",
    "create_seat_shares": "createSeatShare",
    "get_seat_shares_me": "getMySeatShare",
    "delete_seat_shares": "cancelSeatShare",
    "create_seat_shares_early_exit": "earlyExitSeatShare",
    "create_seat_requests": "createSeatRequest",
    "get_seat_requests_me": "getMySeatRequest",
    "delete_seat_requests": "cancelSeatRequest",
    "create_seat_requests_early_exit": "earlyExitSeatRequest",
    "get_seat_requests_me_shares": "getSharesForMyRequest",
    "create_seat_requests_me_shares_view": "viewShareDetail",
    "get_seat_requests_me_viewed": "getViewedShares",
  };

  const key = `${prefix}_${raw}`;
  if (specialMappings[key]) return specialMappings[key];

  // fallback: camelCase
  const camel = `${prefix}${raw
    .split("_")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("")}`;
  return camel;
}

// ─── 엔드포인트 정보 추출 ──────────────────────────────────────
function extractEndpoint(path, method, spec) {
  const pathParams = [];
  const queryParams = [];

  for (const p of spec.parameters || []) {
    if (p.in === "path") pathParams.push({ name: p.name, type: "string", required: true });
    if (p.in === "query")
      queryParams.push({
        name: p.name,
        type: p.schema?.type === "number" ? "number" : "string",
        required: !!p.required,
      });
  }

  let bodySchema = null;
  const bodyContent = spec.requestBody?.content?.["application/json"]?.schema;
  if (bodyContent) bodySchema = bodyContent;

  const successCodes = Object.keys(spec.responses || {}).filter(
    (c) => c.startsWith("2")
  );
  let responseSchema = null;
  for (const code of successCodes) {
    const content = spec.responses[code]?.content?.["application/json"]?.schema;
    if (content) {
      responseSchema = content;
      break;
    }
  }

  const needsAuth = !!(spec.security && spec.security.length > 0);
  const noContent = successCodes.includes("204") && !responseSchema;

  return {
    path,
    method: method.toUpperCase(),
    functionName: buildFunctionName(method, path),
    summary: spec.summary || "",
    tags: spec.tags || [],
    pathParams,
    queryParams,
    bodySchema,
    responseSchema,
    needsAuth,
    noContent,
  };
}

// ─── TS 코드 생성 ──────────────────────────────────────────────
function generateCode(endpoints) {
  const lines = [];

  lines.push(`// ──────────────────────────────────────────────────────`);
  lines.push(`// 이 파일은 scripts/generate-api.mjs 로 자동 생성됩니다.`);
  lines.push(`// 직접 수정하지 마세요.`);
  lines.push(`// ──────────────────────────────────────────────────────`);
  lines.push(``);
  lines.push(`import { apiFetch } from './client';`);
  lines.push(``);

  // 타입 정의
  const typeNames = new Map();

  for (const ep of endpoints) {
    // Request body type
    if (ep.bodySchema) {
      const typeName = capitalize(ep.functionName) + "Request";
      typeNames.set(ep.functionName + "_req", typeName);
      lines.push(`export type ${typeName} = ${schemaToTs(ep.bodySchema)};`);
      lines.push(``);
    }

    // Response type
    if (ep.responseSchema) {
      const typeName = capitalize(ep.functionName) + "Response";
      typeNames.set(ep.functionName + "_res", typeName);
      lines.push(`export type ${typeName} = ${schemaToTs(ep.responseSchema)};`);
      lines.push(``);
    }
  }

  // 함수 정의
  for (const ep of endpoints) {
    const params = [];
    const reqType = typeNames.get(ep.functionName + "_req");
    const resType = typeNames.get(ep.functionName + "_res") || "void";

    // path params
    for (const p of ep.pathParams) {
      params.push(`${p.name}: ${p.type}`);
    }

    // query params
    if (ep.queryParams.length > 0) {
      const qFields = ep.queryParams
        .map((q) => `${q.name}${q.required ? "" : "?"}: ${q.type}`)
        .join("; ");
      params.push(`query: { ${qFields} }`);
    }

    // body
    if (reqType) {
      params.push(`body: ${reqType}`);
    }

    const fnSignature = `export async function ${ep.functionName}(${params.join(", ")}): Promise<${resType}>`;

    // build path with interpolation
    let pathExpr = ep.path;
    for (const p of ep.pathParams) {
      pathExpr = pathExpr.replace(`{${p.name}}`, `\${${p.name}}`);
    }

    // build query string
    let queryExpr = "";
    if (ep.queryParams.length > 0) {
      queryExpr = `\n  const searchParams = new URLSearchParams();\n`;
      for (const q of ep.queryParams) {
        if (q.required) {
          queryExpr += `  searchParams.set('${q.name}', String(query.${q.name}));\n`;
        } else {
          queryExpr += `  if (query.${q.name} != null) searchParams.set('${q.name}', String(query.${q.name}));\n`;
        }
      }
      queryExpr += `  const qs = searchParams.toString();\n`;
    }

    const urlPart =
      ep.queryParams.length > 0
        ? "`" + pathExpr + "${qs ? `?${qs}` : ''}" + "`"
        : ep.pathParams.length > 0
        ? "`" + pathExpr + "`"
        : `'${ep.path}'`;

    const fetchOptions = [];
    fetchOptions.push(`method: '${ep.method}'`);
    if (reqType) fetchOptions.push(`body`);
    if (ep.needsAuth) fetchOptions.push(`auth: true`);

    lines.push(`/** ${ep.summary} */`);
    lines.push(`${fnSignature} {`);
    if (queryExpr) lines.push(queryExpr.trimEnd());
    lines.push(`  return apiFetch(${urlPart}, { ${fetchOptions.join(", ")} });`);
    lines.push(`}`);
    lines.push(``);
  }

  return lines.join("\n");
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ─── client.ts 생성 ────────────────────────────────────────────
function generateClientCode() {
  return `// ──────────────────────────────────────────────────────
// API 클라이언트 — 토큰 관리 및 자동 갱신 포함
// ──────────────────────────────────────────────────────

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL!;

type TokenStore = {
  getAccessToken: () => Promise<string | null>;
  getRefreshToken: () => Promise<string | null>;
  setTokens: (access: string, refresh?: string) => Promise<void>;
  clearTokens: () => Promise<void>;
};

let tokenStore: TokenStore | null = null;

export function setTokenStore(store: TokenStore) {
  tokenStore = store;
}

export class ApiError extends Error {
  code: string;
  statusCode: number;

  constructor(code: string, message: string, statusCode: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

type FetchOptions = {
  method: string;
  body?: unknown;
  auth?: boolean;
};

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

async function tryRefresh(): Promise<string | null> {
  if (!tokenStore) return null;

  if (isRefreshing && refreshPromise) return refreshPromise;

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const refreshToken = await tokenStore!.getRefreshToken();
      if (!refreshToken) return null;

      const res = await fetch(\`\${BASE_URL}/api/v1/auth/refresh\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) return null;

      const data = await res.json();
      await tokenStore!.setTokens(data.accessToken);
      return data.accessToken as string;
    } catch {
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function apiFetch<T>(path: string, options: FetchOptions): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (options.auth && tokenStore) {
    const token = await tokenStore.getAccessToken();
    if (token) headers['Authorization'] = \`Bearer \${token}\`;
  }

  let res = await fetch(\`\${BASE_URL}\${path}\`, {
    method: options.method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  // 401 → 토큰 갱신 후 재시도
  if (res.status === 401 && options.auth && tokenStore) {
    const newToken = await tryRefresh();
    if (newToken) {
      headers['Authorization'] = \`Bearer \${newToken}\`;
      res = await fetch(\`\${BASE_URL}\${path}\`, {
        method: options.method,
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
      });
    }
  }

  if (res.status === 204) return undefined as T;

  const data = await res.json();

  if (!res.ok) {
    const err = data?.error;
    throw new ApiError(
      err?.code ?? 'UNKNOWN',
      err?.message ?? 'Unknown error',
      err?.statusCode ?? res.status,
    );
  }

  return data as T;
}
`;
}

// ─── main ──────────────────────────────────────────────────────
async function main() {
  const localFile = process.argv[2];
  let swagger;

  if (localFile && existsSync(localFile)) {
    console.log(`Reading local file: ${localFile}`);
    swagger = JSON.parse(readFileSync(localFile, "utf-8"));
  } else {
    console.log("Fetching Swagger JSON...");
    const res = await fetch(SWAGGER_URL);
    swagger = await res.json();
  }

  console.log(`OpenAPI ${swagger.openapi} — ${swagger.info.title} v${swagger.info.version}`);

  const endpoints = [];

  for (const [path, methods] of Object.entries(swagger.paths)) {
    if (SKIP_PATHS.includes(path)) continue;

    for (const [method, spec] of Object.entries(methods)) {
      if (["get", "post", "put", "patch", "delete"].indexOf(method) === -1) continue;

      const tags = spec.tags || [];
      if (tags.some((t) => SKIP_TAGS.includes(t))) continue;

      const ep = extractEndpoint(path, method, spec);
      endpoints.push(ep);
      console.log(`  ${ep.method.padEnd(6)} ${ep.path} → ${ep.functionName}()`);
    }
  }

  console.log(`\n총 ${endpoints.length}개 엔드포인트 발견\n`);

  mkdirSync(OUTPUT_DIR, { recursive: true });

  // client.ts
  const clientPath = join(OUTPUT_DIR, "client.ts");
  writeFileSync(clientPath, generateClientCode(), "utf-8");
  console.log(`✓ ${clientPath}`);

  // generated.ts
  const code = generateCode(endpoints);
  writeFileSync(OUTPUT_FILE, code, "utf-8");
  console.log(`✓ ${OUTPUT_FILE}`);

  console.log("\nDone!");
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
