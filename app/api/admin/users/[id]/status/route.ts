import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/server/backend-proxy";

export async function PUT(
    request: NextRequest,
    context: { params: Promise<{ id: string }> } // In Next.js 15+, params is a Promise
) {
    const { id } = await context.params;
    const clonedRequest = request.clone();
    const body = await clonedRequest.json().catch(() => ({}));
    const active = body?.active;
    const query = typeof active === "boolean" ? `?active=${active}` : "";

    return proxyToBackend(request, {
        backendPath: `/api/admin/users/${id}/status${query}`,
    });
}
