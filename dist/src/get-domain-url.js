/**
 * get the domain url from the request
 */
export function getDomainUrl(request, options) {
    const host = request.headers.get("X-Forwarded-Host") ??
        request.headers.get("Host") ??
        options?.defaultHost;
    if (!host) {
        throw new Error("Host is required");
    }
    const protocol = options?.protocol ?? (host.includes("localhost") ? "http" : "https");
    return `${protocol}://${host}`;
}
