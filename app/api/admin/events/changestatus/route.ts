import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { status, eventId } = await request.json();
        
        const accessToken = request.headers.get('authorization')?.replace('Bearer ', '');
        
        if (!accessToken) {
            return NextResponse.json(
                { error: 'Access token is required' },
                { status: 401 }
            );
        }

        let endpoint = '';
        console.log(status);
        console.log(typeof(eventId));
        
        if (status === 'PUBLISHED') {
            endpoint = `/api/events/${eventId}/publish`;
        } else if (status === 'CANCELLED') {
            endpoint = `/api/events/${eventId}/cancel`;
        } else {
            return NextResponse.json(
                { error: 'Invalid status' },
                { status: 400 }
            );
        }
        
        const response = await fetch(`${process.env.BACKEND_URL}${endpoint}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}