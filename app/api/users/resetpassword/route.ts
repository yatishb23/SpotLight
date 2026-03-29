import { NextRequest,NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { email, newPassword } = await request.json();
        if (!email || !newPassword) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }
        const response = await fetch(`${process.env.BACKEND_URL}/api/auth/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, newPassword }),
            cache: 'no-store',
        });
        const result = await response.json();
        if (!response.ok) {
            return NextResponse.json({ error: result.error || 'Failed to reset password' }, { status: response.status });
        }
        return NextResponse.json({ success: true, message: 'Password reset successfully' });
    }
    catch (error) {
        console.error('Error resetting password:', error);
        return NextResponse.json({ error: 'An error occurred while resetting password' }, { status: 500 });
    }
}
