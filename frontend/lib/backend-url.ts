export function backendApiUrl(path = "") {
  const baseUrl = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:4000";
  return `${baseUrl.replace(/\/+$/, "")}${path}`;
}
