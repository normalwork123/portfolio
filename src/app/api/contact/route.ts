import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";


interface ContactBody {
  name: string;
  email: string;
  message: string;
}

interface SuccessResponse {
  success: true;
}

interface ErrorResponse {
  success: false;
  error: string;
}

type ApiResponse = SuccessResponse | ErrorResponse;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function buildEmailHtml(
  name: string,
  email: string,
  message: string,
  timestamp: string
): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Portfolio Inquiry</title>
</head>
<body style="margin:0;padding:0;background:#0f0f0f;font-family:'Segoe UI',Arial,sans-serif;color:#e5e5e5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f0f;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#1a1a1a;border-radius:12px;border:1px solid #2a2a2a;overflow:hidden;max-width:600px;width:100%;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#7c3aed,#4f46e5);padding:32px 40px;">
              <p style="margin:0;font-size:13px;font-weight:600;letter-spacing:0.15em;text-transform:uppercase;color:rgba(255,255,255,0.7);">Portfolio Contact</p>
              <h1 style="margin:8px 0 0;font-size:24px;font-weight:700;color:#ffffff;line-height:1.3;">
                New Inquiry from ${name}
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">

              <!-- From -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="padding:16px 20px;background:#242424;border-radius:8px;border-left:3px solid #7c3aed;">
                    <p style="margin:0 0 4px;font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#7c3aed;">From</p>
                    <p style="margin:0;font-size:16px;font-weight:600;color:#ffffff;">${name}</p>
                    <p style="margin:4px 0 0;font-size:14px;color:#a3a3a3;">
                      <a href="mailto:${email}" style="color:#818cf8;text-decoration:none;">${email}</a>
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Message -->
              <p style="margin:0 0 10px;font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#6b7280;">Message</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td style="padding:20px;background:#242424;border-radius:8px;border:1px solid #2e2e2e;">
                    <p style="margin:0;font-size:15px;line-height:1.7;color:#d4d4d4;white-space:pre-wrap;">${message}</p>
                  </td>
                </tr>
              </table>

              <!-- Reply CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td align="center">
                    <a href="mailto:${email}?subject=Re: Your Portfolio Inquiry"
                       style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#7c3aed,#4f46e5);color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;border-radius:50px;letter-spacing:0.02em;">
                      Reply to ${name}
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <hr style="border:none;border-top:1px solid #2a2a2a;margin:0 0 24px;" />

              <!-- Timestamp -->
              <p style="margin:0;font-size:12px;color:#525252;text-align:center;">
                Received on ${timestamp}
              </p>

            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse>> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  if (
    typeof body !== "object" ||
    body === null ||
    Array.isArray(body)
  ) {
    return NextResponse.json(
      { success: false, error: "Request body must be a JSON object." },
      { status: 400 }
    );
  }

  const raw = body as Record<string, unknown>;

  const name = typeof raw.name === "string" ? raw.name.trim() : "";
  const email = typeof raw.email === "string" ? raw.email.trim() : "";
  const message = typeof raw.message === "string" ? raw.message.trim() : "";

  if (!name) {
    return NextResponse.json(
      { success: false, error: "Name is required." },
      { status: 400 }
    );
  }

  if (!email) {
    return NextResponse.json(
      { success: false, error: "Email is required." },
      { status: 400 }
    );
  }

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { success: false, error: "Please provide a valid email address." },
      { status: 400 }
    );
  }

  if (!message) {
    return NextResponse.json(
      { success: false, error: "Message is required." },
      { status: 400 }
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      {
        success: false,
        error:
          "Messaging service is not configured. Please reach out via the social links.",
      },
      { status: 503 }
    );
  }

  // Create a fresh client per request to avoid stale connection state.
  const supabase = createClient(supabaseUrl, supabaseKey);

  const payload: ContactBody = { name, email, message };

  const { error: dbError } = await supabase.from("messages").insert(payload);

  if (dbError) {
    console.error("Supabase Error:", dbError);
    return NextResponse.json(
      { success: false, error: "Failed to send message. Please try again." },
      { status: 500 }
    );
  }

  // Message is safely stored. Attempt email notification — best-effort only.
  const resendKey = process.env.RESEND_API_KEY;

  if (!resendKey) {
    console.warn("RESEND_API_KEY is not set — skipping email notification.");
  } else {
    const resend = new Resend(resendKey);

    const timestamp = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "full",
      timeStyle: "short",
    });

    try {
      const { error: emailError } = await resend.emails.send({
        from: "Portfolio Contact <onboarding@resend.dev>",
        // Temporary recipient while using the Resend free plan.
        // Replace with harshraiwork600@gmail.com after verifying a custom domain.
        to: ["raiharsh600@gmail.com"],
        replyTo: email,
        subject: `📩 New Portfolio Inquiry from ${name}`,
        html: buildEmailHtml(name, email, message, timestamp),
      });

      if (emailError) {
        console.error("Resend Error:", emailError);
      }
    } catch (err: unknown) {
      console.error("Resend Error:", err);
    }
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
