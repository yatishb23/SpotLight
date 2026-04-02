import { NextRequest,NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const accessToken = request.headers.get("Authorization")?.replace("Bearer ", "");
        const eventId = request.nextUrl.searchParams.get("id");
        if (!accessToken) {
            return new Response("Unauthorized", { status: 401 });
        }
        
        const response = await fetch(`${process.env.BACKEND_URL}/api/bookings/events/all/${eventId}`, {
            headers: {
                "Authorization": `Bearer ${accessToken}`,
            },
        });
        console.log(response);
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error("Backend error:", errorData);
            return new Response(errorData.message || "Failed to fetch seats", { status: response.status });
        }
        const seats = await response.json();
        
        console.log(seats);
        
        return new Response(JSON.stringify(seats));
    }
    catch(error) {
        console.error("Error fetching seats:", error);
        return new Response("Failed to fetch seats", { status: 500 });
    }
}