import { NextRequest,NextResponse } from "next/server";
import axios from "axios";

export async function GET(request: NextRequest) {
    try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/events`);
        return NextResponse.json(response.data);
    } catch (error) {
        console.error('Error fetching events:', error);
        return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
    }
}