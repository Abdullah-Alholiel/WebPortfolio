import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import crypto from 'crypto';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || '';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    console.log('Received email:', email);
    console.log('ADMIN_EMAIL env:', ADMIN_EMAIL);

    // Verify email matches admin email
    if (email !== ADMIN_EMAIL) {
      console.error('Email mismatch:', email, 'vs', ADMIN_EMAIL);
      return NextResponse.json(
        { error: 'Unauthorized email address' },
        { status: 403 }
      );
    }

    console.log('Email verified. Generating token...');
    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 86400000; // 1 day (24 hours)

    console.log('Storing token in Redis...');
    // Store token in Redis with TTL (1 day = 86400 seconds)
    await redis.setex(`admin:token:${token}`, 86400, {
      email,
      expiresAt,
    });
    console.log('Token stored successfully with 1 day TTL');

    // Determine base URL - prefer environment variable, then detect from request, fallback to localhost
    let baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    
    // If not set, try to detect from request headers (works automatically in production)
    if (!baseUrl) {
      const host = request.headers.get('host') || request.headers.get('x-forwarded-host');
      
      if (host) {
        // Determine protocol based on host and environment
        let protocol = request.headers.get('x-forwarded-proto');
        
        // If no protocol header, determine based on host and environment
        if (!protocol) {
          // Check if host is localhost or 127.0.0.1 (development)
          const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1') || host.startsWith('localhost:');
          
          // Use http for localhost, https for production
          protocol = isLocalhost ? 'http' : 'https';
        }
        
        baseUrl = `${protocol}://${host}`;
      } else {
        // Fallback to localhost for development
        baseUrl = 'http://localhost:3000';
      }
    }
    
    // Ensure baseUrl doesn't end with a slash
    baseUrl = baseUrl.replace(/\/$/, '');
    
    // Send magic link email
    const magicLink = `${baseUrl}/admin/verify?token=${token}`;
    console.log('Magic link:', magicLink);
    console.log('Base URL:', baseUrl);
    console.log('Sending email to:', email);
    
    try {
      const emailResult = await resend.emails.send({
        from: 'Admin Login <onboarding@resend.dev>',
        to: email,
        subject: 'Login to Portfolio Admin',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Login to Portfolio Admin</h2>
            <p>Click the button below to login to your portfolio admin panel:</p>
            <a href="${magicLink}" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">
              Login to Admin
            </a>
            <p style="color: #666; font-size: 12px; margin-top: 30px;">
              This link will expire in 24 hours.
            </p>
          </div>
        `,
      });
      console.log('Email sent successfully:', emailResult);
    } catch (emailError: any) {
      console.error('Resend error:', emailError);
      
      // If it's a validation error (test email restriction), still return success
      // because the token is already stored in Redis
      if (emailError?.name === 'validation_error') {
        console.log('Test mode - email not sent, but token stored. Link:', magicLink);
        return NextResponse.json({ 
          success: true, 
          message: 'Token created. In test mode, email not sent. Use this link to login:',
          magicLink 
        });
      }
      throw emailError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending magic link:', error);
    return NextResponse.json(
      { error: 'Failed to send magic link', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

