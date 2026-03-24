import { NextRequest, NextResponse } from 'next/server';

const authServiceUrl =
	process.env.AUTH_SERVICE_URL ||
	process.env.USER_SERVICE_URL ||
	process.env.BACKEND_URL ||
	process.env.NEXT_PUBLIC_BACKEND_URL ||
	'http://localhost:1111';

function trimTrailingSlash(value: string) {
	return value.endsWith('/') ? value.slice(0, -1) : value;
}

export async function POST(req: NextRequest) {
	let refreshToken: string | undefined;

	try {
		const body = await req.json().catch(() => ({}));
		refreshToken = body?.refreshToken;
	} catch {
		refreshToken = undefined;
	}

	if (!refreshToken) {
		refreshToken = req.cookies.get('refresh_token')?.value;
	}

	if (refreshToken) {
		try {
			await fetch(`${trimTrailingSlash(authServiceUrl)}/api/auth/logout`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ refreshToken }),
				cache: 'no-store',
			});
		} catch (error) {
			console.error('Backend logout failed:', error);
		}
	}

	const response = NextResponse.json({ success: true, message: 'Logged out' });
	return response;
}
