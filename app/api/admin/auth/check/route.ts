import { NextRequest, NextResponse } from 'next/server';
import { checkAuth } from '../logout/route';

export async function GET(request: NextRequest) {
  try {
    const auth = await checkAuth(request);
    
    if (!auth.authenticated) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({ authenticated: true, email: auth.email });
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}

