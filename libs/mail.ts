import nodemailer from 'nodemailer';
import { S3Client } from '@aws-sdk/client-s3';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from './getR2';
// Configure email transporter for MailHog
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'mailhog', // Use environment variable
  port: parseInt(process.env.SMTP_PORT || '1025', 10), // Use environment variable
  secure: process.env.SMTP_SECURE === 'true', // Use environment variable
});

export async function sendVerificationEmail(email: string, otp: string) {
  const mailOptions = {
    from: process.env.SMTP_FROM || `"Your App" <no-reply@example.com>`, // Use SMTP_FROM
    to: email,
    subject: 'Verify your email address',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Email Verification</h2>
        <p>Thank you for registering. Please use the following OTP to verify your email address:</p>
        <div style="background-color: #f4f4f4; padding: 12px; font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 5px; margin: 20px 0;">
          ${otp}
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this verification, please ignore this email.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

export async function sendPasswordResetEmail(
  email: string,
  otp: string,
  resetUrl?: string,
) {
  const mailOptions = {
    from: process.env.SMTP_FROM || `"Your App" <no-reply@example.com>`, // Use SMTP_FROM
    to: email,
    subject: 'Reset your password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset</h2>
        <p>We received a request to reset your password. Please use the following OTP to reset your password:</p>
        <div style="background-color: #f4f4f4; padding: 12px; font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 5px; margin: 20px 0;">
          ${otp}
        </div>
        ${
          resetUrl
            ? `
        <p>Or click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${
            process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
          }${resetUrl}" 
             style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
            Reset Password
          </a>
        </div>
        `
            : ''
        }
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this password reset, please ignore this email.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

export async function sendContactForm(formData: {
  name: string;
  email: string;
  topic: string;
  priority: string;
  message: string;
  attachments?: File[];
}) {
  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'background-color: #E5E7EB; color: #374151;';
      case 'medium':
        return 'background-color: #DBEAFE; color: #1E40AF;';
      case 'high':
        return 'background-color: #FEF3C7; color: #92400E;';
      case 'urgent':
        return 'background-color: #FEE2E2; color: #B91C1C;';
      default:
        return 'background-color: #DBEAFE; color: #1E40AF;';
    }
  };

  // Process attachments if they exist
  const attachmentLinks = [];
  if (formData.attachments && formData.attachments.length > 0) {
    for (const file of formData.attachments) {
      // Convert File object to ArrayBuffer for S3 upload
      const fileDataArrayBuffer = await file.arrayBuffer();

      // Generate a unique filename using hash
      const hashBuffer = await crypto.subtle.digest(
        'SHA-256',
        fileDataArrayBuffer,
      );
      const hashHex = Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

      // Use original filename extension
      const fileExtension = file.name.split('.').pop();
      const key = `${hashHex}.${fileExtension}`;

      // Create Node.js Buffer for S3 upload
      const s3UploadBuffer = Buffer.from(fileDataArrayBuffer);

      // Upload to R2
      const s3Params = {
        Bucket: process.env.BUCKET_NAME!,
        Key: key,
        Body: s3UploadBuffer, // Use the Node.js Buffer for S3
        ContentType: file.type,
      };

      await s3Client.send(new PutObjectCommand(s3Params));

      // Generate public URL for the file
      const fileUrl = `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${key}`;

      attachmentLinks.push({
        name: file.name,
        size: file.size,
        url: fileUrl,
      });
    }
  }

  // Change the mailOptions object to include a fallback for the from field
  const mailOptions = {
    from: formData.email, // This uses the sender's email as 'from', which might be an issue with some mail servers.
    // For MailHog it's fine. For production, you'd typically use a fixed 'from' address.
    to: 'fajarfernandi.id@gmail.com',
    subject: `Contact Form: ${formData.topic} - ${formData.priority} Priority`,
    text: `
  Name: ${formData.name}
  Email: ${formData.email}
  Topic: ${formData.topic}
  Priority: ${formData.priority}
  Message: ${formData.message}
  ${
    attachmentLinks.length > 0
      ? `
  Attachments:
  ${attachmentLinks
    .map(
      (file) =>
        `- ${file.name} (${(file.size / 1024).toFixed(2)} KB): ${file.url}`,
    )
    .join('\n')}
  `
      : ''
  }
    `,
    html: ` <!DOCTYPE html>
  <html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <title>Contact Form Submission</title>
    <style>
      @media only screen and (max-width: 620px) {
        table.body h1 {
          font-size: 28px !important;
          margin-bottom: 10px !important;
        }
        table.body p,
        table.body ul,
        table.body ol,
        table.body td,
        table.body span,
        table.body a {
          font-size: 16px !important;
        }
        table.body .wrapper,
        table.body .article {
          padding: 10px !important;
        }
        table.body .content {
          padding: 0 !important;
        }
        table.body .container {
          padding: 0 !important;
          width: 100% !important;
        }
        table.body .main {
          border-left-width: 0 !important;
          border-radius: 0 !important;
          border-right-width: 0 !important;
        }
        table.body .btn table {
          width: 100% !important;
        }
        table.body .btn a {
          width: 100% !important;
        }
        table.body .img-responsive {
          height: auto !important;
          max-width: 100% !important;
          width: auto !important;
        }
      }
      @media all {
        .ExternalClass {
          width: 100%;
        }
        .ExternalClass,
        .ExternalClass p,
        .ExternalClass span,
        .ExternalClass font,
        .ExternalClass td,
        .ExternalClass div {
          line-height: 100%;
        }
        .apple-link a {
          color: inherit !important;
          font-family: inherit !important;
          font-size: inherit !important;
          font-weight: inherit !important;
          line-height: inherit !important;
          text-decoration: none !important;
        }
        #MessageViewBody a {
          color: inherit;
          text-decoration: none;
          font-size: inherit;
          font-family: inherit;
          font-weight: inherit;
          line-height: inherit;
        }
        .btn-primary table td:hover {
          background-color: #3498db !important;
        }
        .btn-primary a:hover {
          background-color: #3498db !important;
          border-color: #3498db !important;
        }
      }
    </style>
  </head>
  <body style="background-color: #f6f6f6; font-family: sans-serif; -webkit-font-smoothing: antialiased; font-size: 14px; line-height: 1.4; margin: 0; padding: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;">
    <span class="preheader" style="color: transparent; display: none; height: 0; max-height: 0; max-width: 0; opacity: 0; overflow: hidden; mso-hide: all; visibility: hidden; width: 0;">New contact form submission from ${
      formData.name
    }</span>
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="body" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #f6f6f6; width: 100%;" width="100%" bgcolor="#f6f6f6">
      <tr>
        <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">&nbsp;</td>
        <td class="container" style="font-family: sans-serif; font-size: 14px; vertical-align: top; display: block; max-width: 580px; padding: 10px; width: 580px; margin: 0 auto;" width="580" valign="top">
          <div class="content" style="box-sizing: border-box; display: block; margin: 0 auto; max-width: 580px; padding: 10px;">
  
            <!-- START CENTERED WHITE CONTAINER -->
            <table role="presentation" class="main" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; background: #ffffff; border-radius: 3px; width: 100%;" width="100%">
  
              <!-- START MAIN CONTENT AREA -->
              <tr>
                <td class="wrapper" style="font-family: sans-serif; font-size: 14px; vertical-align: top; box-sizing: border-box; padding: 20px;" valign="top">
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;" width="100%">
                    <tr>
                      <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">
                        <div style="background-color: #4F46E5; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
                          <h1 style="color: white; font-size: 24px; font-weight: bold; margin: 0;">New Contact Form Submission</h1>
                        </div>
                        <div style="padding: 20px; border: 1px solid #e9e9e9; border-top: none; border-radius: 0 0 5px 5px;">
                          <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">You have received a new contact form submission with the following details:</p>
                          
                          <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%; margin-bottom: 20px;" width="100%">
                            <tr>
                              <td style="font-family: sans-serif; font-size: 14px; vertical-align: top; padding: 10px; background-color: #f8f9fa; border-bottom: 1px solid #e9e9e9; font-weight: bold; width: 30%;" valign="top">Name</td>
                              <td style="font-family: sans-serif; font-size: 14px; vertical-align: top; padding: 10px; background-color: #f8f9fa; border-bottom: 1px solid #e9e9e9;" valign="top">${
                                formData.name
                              }</td>
                            </tr>
                            <tr>
                              <td style="font-family: sans-serif; font-size: 14px; vertical-align: top; padding: 10px; border-bottom: 1px solid #e9e9e9; font-weight: bold;" valign="top">Email</td>
                              <td style="font-family: sans-serif; font-size: 14px; vertical-align: top; padding: 10px; border-bottom: 1px solid #e9e9e9;" valign="top"><a href="mailto:${
                                formData.email
                              }" style="color: #4F46E5; text-decoration: underline;">${
      formData.email
    }</a></td>
                            </tr>
                            <tr>
                              <td style="font-family: sans-serif; font-size: 14px; vertical-align: top; padding: 10px; background-color: #f8f9fa; border-bottom: 1px solid #e9e9e9; font-weight: bold;" valign="top">Topic</td>
                              <td style="font-family: sans-serif; font-size: 14px; vertical-align: top; padding: 10px; background-color: #f8f9fa; border-bottom: 1px solid #e9e9e9;" valign="top">${
                                formData.topic
                              }</td>
                            </tr>
                            <tr>
                              <td style="font-family: sans-serif; font-size: 14px; vertical-align: top; padding: 10px; border-bottom: 1px solid #e9e9e9; font-weight: bold;" valign="top">Priority</td>
                              <td style="font-family: sans-serif; font-size: 14px; vertical-align: top; padding: 10px; border-bottom: 1px solid #e9e9e9;" valign="top">
                                <span style="display: inline-block; padding: 5px 10px; border-radius: 15px; font-size: 12px; font-weight: bold; text-transform: uppercase; ${getPriorityStyle(
                                  formData.priority,
                                )}">
                                  ${formData.priority}
                                </span>
                              </td>
                            </tr>
                            ${
                              attachmentLinks.length > 0
                                ? `
                            <tr>
                              <td style="font-family: sans-serif; font-size: 14px; vertical-align: top; padding: 10px; background-color: #f8f9fa; border-bottom: 1px solid #e9e9e9; font-weight: bold;" valign="top">Attachments</td>
                              <td style="font-family: sans-serif; font-size: 14px; vertical-align: top; padding: 10px; background-color: #f8f9fa; border-bottom: 1px solid #e9e9e9;" valign="top">
                                ${attachmentLinks
                                  .map(
                                    (file) =>
                                      `<div><a href="${
                                        file.url
                                      }" target="_blank" style="color: #4F46E5;">${
                                        file.name
                                      }</a> (${(file.size / 1024).toFixed(
                                        2,
                                      )} KB)</div>`,
                                  )
                                  .join('')}
                              </td>
                            </tr>
                            `
                                : ''
                            }
                          </table>
                          
                          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                            <h3 style="color: #4F46E5; font-size: 16px; font-weight: bold; margin: 0 0 10px 0;">Message</h3>
                            <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; line-height: 1.6; white-space: pre-wrap;">${
                              formData.message
                            }</p>
                          </div>
                          
                          <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">You can reply directly to this email to respond to ${
                            formData.name
                          }.</p>
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
  
            <!-- END MAIN CONTENT AREA -->
            </table>
            <!-- END CENTERED WHITE CONTAINER -->
  
            <!-- START FOOTER -->
            <div class="footer" style="clear: both; margin-top: 10px; text-align: center; width: 100%;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;" width="100%">
                <tr>
                  <td class="content-block" style="font-family: sans-serif; vertical-align: top; padding-bottom: 10px; padding-top: 10px; color: #999999; font-size: 12px; text-align: center;" valign="top" align="center">
                    <span class="apple-link" style="color: #999999; font-size: 12px; text-align: center;">This email was sent from your website contact form</span>
                  </td>
                </tr>
                <tr>
                  <td class="content-block powered-by" style="font-family: sans-serif; vertical-align: top; padding-bottom: 10px; padding-top: 10px; color: #999999; font-size: 12px; text-align: center;" valign="top" align="center">
                    Powered by <a href="https://yourwebsite.com" style="color: #999999; font-size: 12px; text-align: center; text-decoration: none;">Your Website</a>
                  </td>
                </tr>
              </table>
            </div>
            <!-- END FOOTER -->
  
          </div>
        </td>
        <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">&nbsp;</td>
      </tr>
    </table>
  </body>
  </html>`,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    return result;
  } catch (error) {
    throw error;
  }
}
