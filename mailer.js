require("dotenv").config();
const nodemailer = require("nodemailer");
const sql = require("./database");

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin.studyportal@gmail.com";

/**
 * Format registration time into both human-readable and standard ISO strings
 */
function formatRegistrationTime(timeInput) {
  let dateObj;
  if (timeInput instanceof Date) {
    dateObj = timeInput;
  } else if (timeInput) {
    dateObj = new Date(timeInput);
  } else {
    dateObj = new Date();
  }

  // Fallback if invalid date
  if (isNaN(dateObj.getTime())) {
    dateObj = new Date();
  }

  const localFormatted = dateObj.toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZoneName: "short"
  });

  const isoFormatted = dateObj.toISOString();

  return {
    dateObj,
    localFormatted,
    isoFormatted,
    fullDisplay: `${localFormatted} (${isoFormatted})`
  };
}

/**
 * Creates and returns Nodemailer transporter if SMTP credentials are provided
 */
function getTransporter() {
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 465;
  const secure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465;

  if (user && pass) {
    if (!host || host.toLowerCase().includes("gmail")) {
      return nodemailer.createTransport({
        service: "gmail",
        auth: { user, pass }
      });
    }
    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass }
    });
  }

  return null;
}

/**
 * Mask email for secure status reporting
 */
function maskEmail(email) {
  if (!email || !email.includes("@")) return email;
  const [name, domain] = email.split("@");
  if (name.length <= 2) return `*@${domain}`;
  return `${name[0]}***${name[name.length - 1]}@${domain}`;
}

/**
 * Return current email configuration status
 */
function getEmailConfigStatus() {
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const host = process.env.SMTP_HOST || "smtp.gmail.com (service: gmail)";
  return {
    adminEmail: ADMIN_EMAIL,
    isConfigured: Boolean(user && (process.env.SMTP_PASS || process.env.EMAIL_PASS)),
    sender: user ? maskEmail(user) : "Not Configured (Preview / Console Mode)",
    host: host
  };
}

/**
 * Generate beautiful HTML template for admin registration alert
 */
function generateRegistrationAlertHTML({ name, email, timeFormatted, role, id, portalUrl }) {
  const targetPortalUrl = portalUrl || "http://localhost:3000/#admin";
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New User Registration Alert</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.6;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 30px 15px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); border: 1px solid #e2e8f0;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%); padding: 30px; text-align: left;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <span style="display: inline-block; background-color: rgba(56, 189, 248, 0.2); color: #38bdf8; font-size: 11px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; padding: 4px 10px; border-radius: 9999px; margin-bottom: 12px; border: 1px solid rgba(56, 189, 248, 0.3);">
                      ADMINISTRATOR NOTIFICATION
                    </span>
                    <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 700; letter-spacing: -0.5px;">
                      Student Study Resource Portal
                    </h1>
                    <p style="margin: 6px 0 0 0; color: #94a3b8; font-size: 13px;">
                      Real-time user registration event monitor
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 32px 30px 24px 30px;">
              <h2 style="margin: 0 0 12px 0; font-size: 18px; color: #0f172a; font-weight: 700;">
                🔔 New Student / User Account Registered
              </h2>
              <p style="margin: 0 0 24px 0; color: #475569; font-size: 14px;">
                Hello <strong>Portal Administrator</strong>, a new member has just completed account registration on the LearnHub Student Study Resource Portal. Below are the verified registration credentials and timestamp:
              </p>

              <!-- Details Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0;">
                    <span style="display: block; font-size: 11px; text-transform: uppercase; font-weight: 700; color: #64748b; letter-spacing: 0.5px;">
                      👤 Registered Person's Name
                    </span>
                    <strong style="display: block; font-size: 16px; color: #0f172a; margin-top: 2px;">
                      ${escapeHtml(name)}
                    </strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0;">
                    <span style="display: block; font-size: 11px; text-transform: uppercase; font-weight: 700; color: #64748b; letter-spacing: 0.5px;">
                      ✉️ Registered Email Address
                    </span>
                    <a href="mailto:${escapeHtml(email)}" style="display: block; font-size: 15px; color: #2563eb; font-weight: 600; text-decoration: none; margin-top: 2px;">
                      ${escapeHtml(email)}
                    </a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0;">
                    <span style="display: block; font-size: 11px; text-transform: uppercase; font-weight: 700; color: #64748b; letter-spacing: 0.5px;">
                      🕒 Registration Date & Time
                    </span>
                    <strong style="display: block; font-size: 14px; color: #0f172a; margin-top: 2px;">
                      ${escapeHtml(timeFormatted.localFormatted)}
                    </strong>
                    <span style="display: block; font-size: 12px; color: #64748b; font-family: monospace; margin-top: 2px;">
                      ISO: ${escapeHtml(timeFormatted.isoFormatted)}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 20px;">
                    <span style="display: block; font-size: 11px; text-transform: uppercase; font-weight: 700; color: #64748b; letter-spacing: 0.5px;">
                      🛡️ Assigned Role & System ID
                    </span>
                    <span style="display: inline-block; background-color: #dbeafe; color: #1e40af; font-size: 12px; font-weight: 700; padding: 2px 8px; border-radius: 4px; margin-top: 4px; text-transform: uppercase;">
                      ${escapeHtml(role || "user")}
                    </span>
                    ${id ? `<span style="margin-left: 8px; font-size: 13px; color: #64748b; font-family: monospace;">Account ID: #${escapeHtml(String(id))}</span>` : ""}
                  </td>
                </tr>
              </table>

              <!-- Call to Action -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <a href="${escapeHtml(targetPortalUrl)}" target="_blank" style="display: inline-block; background: #2563eb; color: #ffffff; font-weight: 600; font-size: 14px; text-decoration: none; padding: 12px 28px; border-radius: 6px; box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);">
                      Open Admin Directory & Console →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; font-size: 12px; color: #64748b; text-align: center;">
                You can manage user privileges or review published notes anytime from the Master Admin Console.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 30px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                This is an automated notification dispatched to the system administrator: 
                <strong style="color: #64748b;">${escapeHtml(ADMIN_EMAIL)}</strong>
              </p>
              <p style="margin: 6px 0 0 0; font-size: 11px; color: #cbd5e1;">
                Student Study Resource Portal © 2026. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Basic HTML escaping helper to prevent injection in emails
 */
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Dispatch notification email to Admin when someone registers
 * @param {Object} params
 * @param {string} params.name - User's full name
 * @param {string} params.email - User's email
 * @param {Date|string} [params.time] - Registration timestamp
 * @param {string} [params.role] - Assigned role (e.g. 'user' or 'admin')
 * @param {number|string} [params.id] - User ID in Neon database
 * @param {string} [params.portalUrl] - Base URL to the portal
 */
async function sendAdminRegistrationNotification({ name, email, time, role, id, portalUrl }) {
  const timeFormatted = formatRegistrationTime(time);
  const cleanName = String(name || "New Student").trim();
  const cleanEmail = String(email || "unknown@student.edu").trim();
  const cleanRole = String(role || "user").trim();

  const subject = `🔔 New User Registration Alert: ${cleanName} (${cleanEmail})`;
  const textContent = `
[STUDENT STUDY RESOURCE PORTAL - ADMIN ALERT]
============================================================
A new user has just registered on the portal.

• Registered Name:  ${cleanName}
• Registered Email: ${cleanEmail}
• Registration Time: ${timeFormatted.localFormatted}
• ISO Timestamp:     ${timeFormatted.isoFormatted}
• Assigned Role:     ${cleanRole.toUpperCase()}
${id ? `• User ID:           #${id}\n` : ""}
============================================================
Recipient Administrator: ${ADMIN_EMAIL}
Portal Admin Console: ${portalUrl || "http://localhost:3000/#admin"}
============================================================
`.trim();

  const htmlContent = generateRegistrationAlertHTML({
    name: cleanName,
    email: cleanEmail,
    timeFormatted,
    role: cleanRole,
    id,
    portalUrl
  });

  let deliveryStatus = "pending";
  let notificationId = null;

  // 1. Record the notification in Neon DB
  try {
    const inserted = await sql`
      INSERT INTO admin_notifications (
        type, recipient, user_name, user_email, user_role, registered_at, status, details
      )
      VALUES (
        'user_registered',
        ${ADMIN_EMAIL},
        ${cleanName},
        ${cleanEmail},
        ${cleanRole},
        ${timeFormatted.dateObj},
        'pending',
        ${JSON.stringify({ isoTime: timeFormatted.isoFormatted, userId: id || null })}
      )
      RETURNING id
    `;
    if (inserted && inserted.length > 0) {
      notificationId = inserted[0].id;
    }
  } catch (dbErr) {
    console.warn("Notice: Could not write notification to database:", dbErr.message);
  }

  // 2. Check for configured SMTP Transporter
  const transporter = getTransporter();

  if (transporter) {
    try {
      const senderAddress = process.env.SMTP_FROM || process.env.SMTP_USER || process.env.EMAIL_USER || `"Study Portal Alerts" <${ADMIN_EMAIL}>`;
      const mailOptions = {
        from: senderAddress,
        to: ADMIN_EMAIL,
        subject: subject,
        text: textContent,
        html: htmlContent
      };

      const info = await transporter.sendMail(mailOptions);
      deliveryStatus = "delivered";

      console.log(`\n✓ [ADMIN EMAIL NOTIFICATION SENT]`);
      console.log(`  To: ${ADMIN_EMAIL}`);
      console.log(`  Subject: ${subject}`);
      console.log(`  Message ID: ${info.messageId}`);
      console.log(`  Registered Person: ${cleanName} <${cleanEmail}>`);
      console.log(`  Time: ${timeFormatted.fullDisplay}\n`);

      if (notificationId) {
        await sql`UPDATE admin_notifications SET status = 'delivered', details = ${JSON.stringify({ messageId: info.messageId, time: timeFormatted.isoFormatted })} WHERE id = ${notificationId}`.catch(() => {});
      }

      return {
        success: true,
        mode: "live_smtp",
        messageId: info.messageId,
        recipient: ADMIN_EMAIL,
        registeredUser: { name: cleanName, email: cleanEmail, time: timeFormatted.fullDisplay }
      };
    } catch (smtpErr) {
      deliveryStatus = "failed: " + smtpErr.message;
      console.error(`\n⚠ [ADMIN EMAIL DELIVERY FAILED]`);
      console.error(`  Recipient: ${ADMIN_EMAIL}`);
      console.error(`  Error: ${smtpErr.message}`);
      console.error(`  User details recorded in DB regardless: ${cleanName} <${cleanEmail}>\n`);

      if (notificationId) {
        await sql`UPDATE admin_notifications SET status = 'failed', details = ${JSON.stringify({ error: smtpErr.message })} WHERE id = ${notificationId}`.catch(() => {});
      }

      return {
        success: false,
        mode: "live_smtp_failed",
        error: smtpErr.message,
        recipient: ADMIN_EMAIL,
        registeredUser: { name: cleanName, email: cleanEmail, time: timeFormatted.fullDisplay }
      };
    }
  } else {
    // 3. Graceful Fallback: Console & Logged Notification
    // Prints a prominent, formatted alert so admin sees the registration immediately in server logs
    deliveryStatus = "logged_ready_for_smtp";

    console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                   🔔 NEW USER REGISTRATION NOTIFICATION                      ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ Recipient (Admin Email) : ${ADMIN_EMAIL.padEnd(50)} ║
║ Registered Person Name  : ${cleanName.padEnd(50)} ║
║ Registered Person Email : ${cleanEmail.padEnd(50)} ║
║ Registration Time       : ${timeFormatted.localFormatted.padEnd(50)} ║
║ ISO Timestamp           : ${timeFormatted.isoFormatted.padEnd(50)} ║
║ Role Assigned           : ${cleanRole.toUpperCase().padEnd(50)} ║
║ Delivery Status         : Logged in DB & Server (Add SMTP_USER/PASS in .env)  ║
╚══════════════════════════════════════════════════════════════════════════════╝
    `);

    if (notificationId) {
      await sql`UPDATE admin_notifications SET status = 'logged', details = ${JSON.stringify({ note: "Notification logged. Provide SMTP_USER & SMTP_PASS in .env for external inbox delivery.", time: timeFormatted.isoFormatted })} WHERE id = ${notificationId}`.catch(() => {});
    }

    return {
      success: true,
      mode: "preview_logged",
      recipient: ADMIN_EMAIL,
      note: "Notification logged to database and server console. Add SMTP_USER and SMTP_PASS in .env to enable live delivery to external inbox.",
      registeredUser: { name: cleanName, email: cleanEmail, time: timeFormatted.fullDisplay }
    };
  }
}

/**
 * Send an on-demand test notification email to the admin
 */
async function sendTestNotification(targetEmail) {
  const recipient = targetEmail || ADMIN_EMAIL;
  return await sendAdminRegistrationNotification({
    name: "Alex Rivera (Diagnostic Test)",
    email: "student.test@university.edu",
    time: new Date(),
    role: "user",
    id: 9999
  });
}

module.exports = {
  ADMIN_EMAIL,
  formatRegistrationTime,
  getEmailConfigStatus,
  sendAdminRegistrationNotification,
  sendTestNotification
};
