import logging
import random
import string

import resend
from django.conf import settings

logger = logging.getLogger(__name__)


def generate_verification_code():
    return ''.join(random.choices(string.digits, k=6))


def send_verification_email(to_email, code, purpose='email_verify'):
    if purpose == 'password_reset':
        subject = 'Password Reset Code'
        html_body = f"""
        <h2>Password Reset</h2>
        <p>Your password reset code is:</p>
        <h1 style="letter-spacing: 8px; font-size: 36px; text-align: center;">{code}</h1>
        <p>This code will expire in <strong>10 minutes</strong>.</p>
        <p>If you didn't request this, please ignore this email.</p>
        """
    else:
        subject = 'Verify Your Email'
        html_body = f"""
        <h2>Email Verification</h2>
        <p>Your verification code is:</p>
        <h1 style="letter-spacing: 8px; font-size: 36px; text-align: center;">{code}</h1>
        <p>This code will expire in <strong>24 hours</strong>.</p>
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
