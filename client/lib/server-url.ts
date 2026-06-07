import "server-only";

import { headers } from "next/headers";

export async function getInternalApiUrl(path: string) {
    const headerStore = await headers();
    const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
    const protocol = headerStore.get("x-forwarded-proto") ?? "http";

    if (!host) {
        throw new Error("Unable to resolve request host for internal API call");
    }

    return `${protocol}://${host}${path}`;
}

export async function getInternalApiHeaders() {
    const headerStore = await headers();
    const cookie = headerStore.get("cookie");
    const requestHeaders: Record<string, string> = {};

    if (cookie) {
        requestHeaders.cookie = cookie;
    }

    return requestHeaders;
}