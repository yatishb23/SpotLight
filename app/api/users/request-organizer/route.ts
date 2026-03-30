import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/server/backend-proxy";

export async function POST(request: NextRequest) {
    const userId = request.nextUrl.searchParams.get("id");
    const accessToken = request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!userId) {
        return new Response(JSON.stringify({ error: "User ID is required" }), { status: 400 });
    }
    
    try {
        const response = await fetch(`${process.env.BACKEND_URL}/api/users/request-organizer`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
                "userId": userId,
            }
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            return new Response(JSON.stringify({ error: errorData?.message || "Failed to submit request" }), { status: response.status || 500 });
        }
        return new Response(JSON.stringify({ message: "Request submitted successfully" }), { status: 200 });
    }
    catch (error) {
        console.error("Error proxying request:", error);
        return new Response(JSON.stringify({ error: "Failed to process request" }), { status: 500 });
    }   
}

export async function GET(request: NextRequest) {
    const accessToken = request.headers.get('Authorization')?.replace('Bearer ', '');
    
    
    try{
        const response = await fetch(`${process.env.BACKEND_URL}/api/admin/users/requests`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            }
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            return new Response(JSON.stringify({ error: errorData?.message || "Failed to fetch request status" }), { status: response.status || 500 });
        }
        const data = await response.json();
        
        
        return new Response(JSON.stringify(data), { status: 200 });
    }
    catch (error) {
        console.error("Error fetching request status:", error);
        return new Response(JSON.stringify({ error: "Failed to fetch request status" }), { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    const userId = request.nextUrl.searchParams.get("id");
    const {isApproved} = await request.json();
    const accessToken = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!userId) {
        return new Response(JSON.stringify({ error: "User ID is required" }), { status: 400 });
    }
    
    try{
        const response = await fetch(`${process.env.BACKEND_URL}/api/admin/users/${userId}/approve-organizer/${isApproved}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            }
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            return new Response(JSON.stringify({ error: errorData?.message || "Failed to fetch request status" }), { status: response.status || 500 });
        }
        const data = await response.json();
       
        
        return new Response(JSON.stringify(data));
    }
    catch (error) {
        console.error("Error fetching request status:", error);
        return new Response(JSON.stringify({ error: "Failed to fetch request status" }), { status: 500 });
    }
}