const cloudMysqlHosts = [
  ".planetscale.com",
  ".aivencloud.com",
  ".clever-cloud.com"
];

const railwayMysqlHosts = [".railway.app", ".rlwy.net"];

function appendQueryParam(url: string, param: string): string {
  return url.includes("?") ? `${url}&${param}` : `${url}?${param}`;
}

function getHostname(databaseUrl: string): string | null {
  const match = databaseUrl.match(/^mysql:\/\/(?:[^@]+@)?([^:/]+)/);
  return match?.[1] ?? null;
}

function requiresExternalSsl(hostname: string): boolean {
  if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "mysql") {
    return false;
  }

  return (
    railwayMysqlHosts.some((suffix) => hostname.endsWith(suffix) || hostname.includes(suffix)) ||
    cloudMysqlHosts.some((suffix) => hostname.endsWith(suffix) || hostname.includes(suffix))
  );
}

function getSslAcceptMode(hostname: string): "strict" | "accept_invalid_certs" {
  if (railwayMysqlHosts.some((suffix) => hostname.endsWith(suffix) || hostname.includes(suffix))) {
    return "accept_invalid_certs";
  }

  return "strict";
}

export function normalizeDatabaseUrl(databaseUrl: string, nodeEnv: string): string {
  if (nodeEnv === "test") {
    return databaseUrl;
  }

  if (databaseUrl.includes("sslaccept=") || databaseUrl.includes("ssl-mode=") || databaseUrl.includes("sslmode=")) {
    return databaseUrl;
  }

  const hostname = getHostname(databaseUrl);
  if (!hostname) {
    return databaseUrl;
  }

  if (hostname.includes(".internal")) {
    console.warn(
      "DATABASE_URL uses an internal hostname. External hosts such as Render must use the public TCP proxy endpoint from your database provider."
    );
    return databaseUrl;
  }

  if (nodeEnv === "production" && requiresExternalSsl(hostname)) {
    const normalized = appendQueryParam(databaseUrl, `sslaccept=${getSslAcceptMode(hostname)}`);
    console.info(`Applied MySQL SSL settings for ${hostname}`);
    return normalized;
  }

  return databaseUrl;
}
