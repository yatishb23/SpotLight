import { NextRequest,NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { userId, currentPassword, newPassword } = await request.json();
        console.log(userId+" "+currentPassword);
        
        if (!userId || !currentPassword || !newPassword) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }
        const response = await fetch(`${process.env.BACKEND_URL}/api/users/changepassword`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({id: userId, oldPassword: currentPassword, newPassword }),
            cache: 'no-store',
        });
        const result = await response.json();
        if (!response.ok) {
            return NextResponse.json({ error: result.error || 'Failed to change password' }, { status: response.status });
        }
        return NextResponse.json({ success: true, message: 'Password changed successfully' });
    }
    catch (error) {
        console.error('Error changing password:', error);
        return NextResponse.json({ error: 'An error occurred while changing password' }, { status: 500 });
    }
}