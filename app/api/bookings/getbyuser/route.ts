import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const accessToken = request.headers.get('Authorization')?.replace('Bearer ', '');
        if (!userId) {
            return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
        }
        
        const response = await fetch(`${process.env.BACKEND_URL}/api/bookings/my`, {
            method: 'GET',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
                'X-User-Id': userId
            },
            cache: 'no-store',
        });
        const result = await response.json();
        
        if (!response.ok) {
            return NextResponse.json({ error: result.error || 'Failed to fetch bookings' }, { status: response.status });
        }
        return NextResponse.json(result);
    }
    catch (error) {
        console.error('Error fetching bookings:', error);
        return NextResponse.json({ error: 'An error occurred while fetching bookings' }, { status: 500 });
    }
}
