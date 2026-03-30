import { NextRequest,NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const accessToken = request.headers.get('Authorization')?.replace('Bearer ', '');
    const eventId = searchParams.get('eventId')
    if(!eventId){
        return NextResponse.json({error:"Event ID is required"}, {status:400});
    }
    try {
        const response = await fetch(`${process.env.BACKEND_URL}/api/bookings/${eventId}/seats`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
        });
        if (!response.ok) {
            throw new Error(`API error: ${response.statusText}`);
        }
        const data = await response.json();
        console.log(data);
        
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching booked seats:", error);
        return NextResponse.json({ error: "Failed to fetch booked seats" }, { status: 500 });
    }
}