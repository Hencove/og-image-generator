import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: '/',
};

/**
 * Middleware to password-protect the demo page
 * Set DEMO_PASSWORD environment variable to enable protection
 */
export function middleware(request: NextRequest) {
  const demoPassword = process.env.DEMO_PASSWORD;

  // If no password is set, allow access
  if (!demoPassword) {
    return NextResponse.next();
  }

  // Check if user has provided credentials
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return new NextResponse('Authentication required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Demo Page"',
      },
    });
  }

  // Decode and verify credentials
  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString(
    'utf-8',
  );
  const [username, password] = credentials.split(':');

  // Check password (username is ignored, any username works)
  if (password === demoPassword) {
    return NextResponse.next();
  }

  return new NextResponse('Invalid credentials', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Demo Page"',
    },
  });
}
