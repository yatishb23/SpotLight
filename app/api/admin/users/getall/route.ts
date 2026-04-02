import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/server/backend-proxy";

export async function GET(request: NextRequest) {
    try{
        const accessToken = request.headers.get("Authorization")?.replace("Bearer ", "");
        if (!accessToken) {
            return new Response("Unauthorized", { status: 401 });
        }
        const response = await fetch(`${process.env.BACKEND_URL}/api/admin/users/getAll`, {
            headers: {
                "Authorization": `Bearer ${accessToken}`,
            },
        });
        if (!response.ok) {
            const errorData = await response.json();
            console.error("Backend error:", errorData);
            return new Response(errorData.message || "Failed to fetch users", { status: response.status });
        }
        const users = await response.json();
        return new Response(JSON.stringify(users));
    }
    catch(error){
        console.error("Error fetching users:", error);
        return new Response("Failed to fetch users", { status: 500 });
    }
}