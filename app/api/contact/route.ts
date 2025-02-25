import { NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { emailService } from "@/lib/email/providers";
import type { ContactFormData } from "@/types/contact";

// Enhanced logging utility with structured output
const logError = (context: string, error: any, metadata: Record<string, any> = {}) => {
  const timestamp = new Date().toISOString();
  console.error({
    timestamp,
    context,
    error: error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: (error as any).code
    } : error,
    ...metadata
  });
};

// Enhanced email validation regex
const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// Enhanced contact form schema with detailed validation
const contactSchema = z.object({
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .regex(/^[a-zA-Z\s]*$/, "Name must contain only letters")
    .transform(val => val.trim()),
  email: z.string()
    .email("Invalid email format")
    .regex(emailRegex, "Please enter a valid email address")
    .transform(val => val.toLowerCase().trim()),
  subject: z.string()
    .min(5, "Subject must be at least 5 characters")
    .max(200, "Subject must not exceed 200 characters")
    .transform(val => val.trim()),
  message: z.string()
    .min(10, "Message must be at least 10 characters")
    .max(1000, "Message must not exceed 1000 characters")
    .transform(val => val.trim()),
  timestamp: z.string().datetime(),
  token: z.string(),
  honeypot: z.string().max(0).optional(),
});

// Enhanced reCAPTCHA verification with detailed error handling
const verifyRecaptcha = async (token: string) => {
  const diagnosticInfo = {
    startTime: new Date().toISOString(),
    development: process.env.NODE_ENV === 'development'
  };

  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  try {
    const recaptchaResponse = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
      { 
        method: "POST",
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    if (!recaptchaResponse.ok) {
      throw new Error(`reCAPTCHA verification failed: ${recaptchaResponse.statusText}`);
    }

    const recaptchaData = await recaptchaResponse.json();
    
    diagnosticInfo.success = recaptchaData.success;
    diagnosticInfo.score = recaptchaData.score;
    diagnosticInfo.action = recaptchaData.action;
    
    if (!recaptchaData.success) {
      logError('reCAPTCHA Verification Failed', null, {
        ...diagnosticInfo,
        errorCodes: recaptchaData['error-codes']
      });
    }

    return recaptchaData.success;
  } catch (error) {
    logError('reCAPTCHA Verification Error', error, diagnosticInfo);
    return false;
  }
};

export async function POST(request: Request) {
  const diagnosticInfo = {
    startTime: new Date().toISOString(),
    clientIP: request.headers.get('x-forwarded-for') || 'unknown',
    userAgent: request.headers.get('user-agent'),
  };

  try {
    // Rate limiting with enhanced error handling
    const limiter = await rateLimit(request);
    
    if (!limiter.success) {
      logError('Rate Limit Exceeded', null, diagnosticInfo);
      return NextResponse.json(
        { error: "Too many requests. Please try again in a few minutes." },
        { status: 429 }
      );
    }

    const data = await request.json();
    
    // Enhanced validation with detailed error messages
    const validationResult = contactSchema.safeParse(data);
    
    if (!validationResult.success) {
      const validationErrors = validationResult.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));

      logError('Form Validation Failed', null, {
        ...diagnosticInfo,
        validationErrors
      });

      return NextResponse.json(
        { 
          error: "Please check your input and try again",
          details: validationErrors
        },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;

    // Check honeypot
    if (validatedData.honeypot) {
      logError('Honeypot Triggered', null, diagnosticInfo);
      return NextResponse.json(
        { error: "Form submission rejected" },
        { status: 400 }
      );
    }

    // Verify reCAPTCHA token
    const isRecaptchaValid = await verifyRecaptcha(validatedData.token);
    
    if (!isRecaptchaValid) {
      return NextResponse.json(
        { error: "Security verification failed. Please refresh the page and try again." },
        { status: 400 }
      );
    }

    try {
      await emailService.sendEmail({
        to: process.env.SMTP_USER!,
        subject: `Contact Form: ${validatedData.subject}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${validatedData.name}</p>
          <p><strong>Email:</strong> ${validatedData.email}</p>
          <p><strong>Subject:</strong> ${validatedData.subject}</p>
          <p><strong>Message:</strong></p>
          <p>${validatedData.message}</p>
          <p><strong>Timestamp:</strong> ${validatedData.timestamp}</p>
          <hr>
          <p><small>Additional Info:</small></p>
          <p><small>IP: ${diagnosticInfo.clientIP}</small></p>
          <p><small>User Agent: ${diagnosticInfo.userAgent}</small></p>
        `,
        text: `
          New Contact Form Submission
          
          Name: ${validatedData.name}
          Email: ${validatedData.email}
          Subject: ${validatedData.subject}
          Message: ${validatedData.message}
          Timestamp: ${validatedData.timestamp}
          
          Additional Info:
          IP: ${diagnosticInfo.clientIP}
          User Agent: ${diagnosticInfo.userAgent}
        `
      });

      // Log successful submission
      logError('Form Submission Success', null, {
        ...diagnosticInfo,
        email: validatedData.email
      });

      return NextResponse.json(
        { message: "Message sent successfully" },
        { status: 200 }
      );
    } catch (error) {
      logError('Email Sending Failed', error, {
        ...diagnosticInfo,
        email: validatedData.email
      });
      
      return NextResponse.json(
        { 
          error: "We're experiencing technical difficulties. Please try again later or contact support directly at support@carlora.com"
        },
        { status: 500 }
      );
    }
  } catch (error) {
    logError('Unexpected Form Error', error, diagnosticInfo);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: "Please check your input and try again",
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: "We're experiencing technical difficulties. Please try again later or contact support directly at support@carlora.com"
      },
      { status: 500 }
    );
  }
}