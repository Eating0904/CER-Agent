import logging
import random
import string

import resend
from django.conf import settings

logger = logging.getLogger(__name__)


def generate_verification_code():
    return ''.join(random.choices(string.digits, k=6))


def send_verification_email(to_email, code, purpose='email_verify'):
    frontend_url = settings.FRONTEND_URL
    if purpose == 'password_reset':
        subject = 'Password Reset Code'
        title = 'Password Reset'
        description = 'We received a request to reset your password. Please use the verification code below to proceed.'
        expiry_text = 'This code will expire in <strong>10 minutes</strong>.'
        ignore_text = "If you didn't request a password reset, you can safely ignore this email."
    else:
        subject = 'Verify Your Email'
        title = 'Email Verification'
        description = f'Thank you for registering! Please login in to {frontend_url} and use the verification code below to verify your email address.'
        expiry_text = 'This code will expire in <strong>24 hours</strong>.'
        ignore_text = "If you didn't create an account, you can safely ignore this email."

    html_body = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head><meta charset="UTF-8"></head>
    <body style="margin:0; padding:0; background-color:#f4f0fa; font-family:Arial, Helvetica, sans-serif;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f0fa; padding:40px 0;">
        <tr>
          <td align="center">
            <!-- Header -->
            <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="border-radius:12px 12px 0 0; overflow:hidden;">
              <tr>
                <td style="background: linear-gradient(135deg, #7c3aed, #a78bfa); padding:28px 32px; text-align:center;">
                  <h1 style="margin:0; font-size:24px; color:#ffffff; font-weight:700; letter-spacing:1px;">CER-Agent</h1>
                </td>
              </tr>
            </table>
            <!-- Body Card + Footer -->
            <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-left:1px solid #e8e0f3; border-right:1px solid #e8e0f3; border-bottom:1px solid #e8e0f3; border-radius:0 0 12px 12px; overflow:hidden;">
              <tr>
                <td style="padding:36px 32px 24px 32px;">
                  <h2 style="margin:0 0 12px 0; font-size:22px; color:#1a1a2e;">{title}</h2>
                  <p style="margin:0 0 24px 0; font-size:15px; color:#555555; line-height:1.6;">{description}</p>

                  <!-- Code Block -->
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="background-color:#f3edff; border:1px solid #e0d4f5; border-radius:10px; padding:20px; text-align:center;">
                        <p style="margin:0 0 8px 0; font-size:13px; color:#7c3aed; font-weight:600; text-transform:uppercase; letter-spacing:1px;">Verification Code</p>
                        <p style="margin:0; font-size:36px; font-weight:700; color:#7c3aed; letter-spacing:10px; font-family:'Courier New', monospace;">{code}</p>
                      </td>
                    </tr>
                  </table>
                  <p style="margin:20px 0 24px 0; font-size:14px; color:#888888; text-align:center;">{expiry_text}</p>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="background-color:#faf8ff; border-top:1px solid #e8e0f3; padding:20px 32px; text-align:center;">
                  <p style="margin:0 0 6px 0; font-size:13px; color:#999999;">{ignore_text}</p>
                  <p style="margin:0; font-size:12px; color:#bbbbbb;">&copy; CER-Agent</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    """

    api_keys = settings.RESEND_API_KEYS
    email_from = settings.EMAIL_FROM
    last_error = None

    for key in api_keys:
        try:
            resend.api_key = key
            resend.Emails.send(
                {
                    'from': email_from,
                    'to': [to_email],
                    'subject': f'[CER-Agent] {subject}',
                    'html': html_body,
                }
            )
            logger.info(f'Email sent to {to_email} (purpose={purpose})')
            return True
        except Exception as e:
            last_error = e
            error_str = str(e)
            if '429' in error_str or 'rate' in error_str.lower():
                logger.warning(f'Resend API key rate limited, trying next key: {e}')
                continue
            logger.exception(f'Failed to send email to {to_email}: {e}')
            raise

    logger.error(f'All Resend API keys exhausted for {to_email}')
    raise last_error or Exception('All Resend API keys exhausted')
