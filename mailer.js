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

let customTransporter = null;

/**
 * Creates and returns Nodemailer transporter if SMTP credentials are provided
 */
function getTransporter() {
  if (customTransporter) {
    return customTransporter;
  }

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
 * Dynamically configure or update the active mail transporter
 */
function setCustomTransporter({ user, pass, host, port, secure }) {
  if (user && pass) {
    process.env.SMTP_USER = user;
    process.env.SMTP_PASS = pass;
    if (host) process.env.SMTP_HOST = host;
    if (port) process.env.SMTP_PORT = String(port);
    if (secure !== undefined) process.env.SMTP_SECURE = String(secure);

    if (!host || host.toLowerCase().includes("gmail")) {
      customTransporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user, pass }
      });
    } else {
      customTransporter = nodemailer.createTransport({
        host,
        port: parseInt(port, 10) || 465,
        secure: secure === true || secure === "true" || port === 465,
        auth: { user, pass }
      });
    }
    return customTransporter;
  }
  return null;
}

/**
 * Test & verify connectivity with the configured mail server
 */
async function verifyTransporterConnection() {
  const transporter = getTransporter();
  if (!transporter) {
    return { ok: false, error: "No SMTP credentials provided. Please supply Gmail address and App Password." };
  }
  try {
    await transporter.verify();
    return { ok: true, message: "SMTP connection verified successfully!" };
  } catch (err) {
    return { ok: false, error: err.message };
  }
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
 * Generate responsive HTML template for admin resource contribution alert
 */
function generateContributionAlertHTML({ name, email, title, subject, description, fileUrl, fileName, timeFormatted, id, portalUrl, status }) {
  const targetPortalUrl = portalUrl || "http://localhost:3000/#admin";
  const displayStatus = (status || "pending").toUpperCase();
  const isPending = displayStatus === "PENDING";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Resource Contribution - Approval Required</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.6;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 30px 15px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table role="presentation" width="100%" style="max-width: 620px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); border: 1px solid #e2e8f0;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%); padding: 30px; text-align: left;">
              <span style="display: inline-block; background-color: rgba(245, 158, 11, 0.25); color: #fbbf24; font-size: 11px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; padding: 4px 10px; border-radius: 9999px; margin-bottom: 12px; border: 1px solid rgba(245, 158, 11, 0.4);">
                ACTION REQUIRED: RESOURCE APPROVAL
              </span>
              <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 700; letter-spacing: -0.5px;">
                Student Study Resource Portal
              </h1>
              <p style="margin: 6px 0 0 0; color: #94a3b8; font-size: 13px;">
                Peer Coursework Contribution Moderation Alert
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 32px 30px 24px 30px;">
              <h2 style="margin: 0 0 12px 0; font-size: 18px; color: #0f172a; font-weight: 700;">
                📝 New Study Material Contributed Awaiting Approval
              </h2>
              <p style="margin: 0 0 20px 0; color: #475569; font-size: 14px;">
                Hello <strong>Portal Administrator</strong>, a student has contributed new study material to the portal repository. In accordance with portal moderation rules, this contribution is <strong>held in pending status</strong> and will only appear to students once you approve it.
              </p>

              <!-- Contribution Details Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0;">
                    <span style="display: block; font-size: 11px; text-transform: uppercase; font-weight: 700; color: #64748b; letter-spacing: 0.5px;">
                      👤 Contributor's Name
                    </span>
                    <strong style="display: block; font-size: 15px; color: #0f172a; margin-top: 2px;">
                      ${escapeHtml(name)}
                    </strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0;">
                    <span style="display: block; font-size: 11px; text-transform: uppercase; font-weight: 700; color: #64748b; letter-spacing: 0.5px;">
                      ✉️ Contributor's Email Address
                    </span>
                    <a href="mailto:${escapeHtml(email)}" style="display: block; font-size: 14px; color: #2563eb; font-weight: 600; text-decoration: none; margin-top: 2px;">
                      ${escapeHtml(email)}
                    </a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0;">
                    <span style="display: block; font-size: 11px; text-transform: uppercase; font-weight: 700; color: #64748b; letter-spacing: 0.5px;">
                      📚 Contributed Resource Title
                    </span>
                    <strong style="display: block; font-size: 16px; color: #0f172a; margin-top: 2px;">
                      ${escapeHtml(title)}
                    </strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0;">
                    <span style="display: block; font-size: 11px; text-transform: uppercase; font-weight: 700; color: #64748b; letter-spacing: 0.5px;">
                      🏷️ In Which Resource / Subject Discipline
                    </span>
                    <span style="display: inline-block; background-color: #dbeafe; color: #1e40af; font-size: 12px; font-weight: 700; padding: 3px 10px; border-radius: 4px; margin-top: 4px;">
                      ${escapeHtml(subject)}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0;">
                    <span style="display: block; font-size: 11px; text-transform: uppercase; font-weight: 700; color: #64748b; letter-spacing: 0.5px;">
                      📄 What They Contributed (Description / Overview)
                    </span>
                    <div style="margin: 6px 0 0 0; font-size: 13.5px; color: #334155; line-height: 1.5; background: #ffffff; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0;">
                      ${escapeHtml(description)}
                    </div>
                  </td>
                </tr>
                ${
                  fileUrl
                    ? `
                <tr>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0;">
                    <span style="display: block; font-size: 11px; text-transform: uppercase; font-weight: 700; color: #64748b; letter-spacing: 0.5px;">
                      📎 Attached Resource File
                    </span>
                    <div style="margin-top: 6px;">
                      <a href="${escapeHtml(fileUrl.startsWith("http") ? fileUrl : (portalUrl ? new URL(fileUrl, portalUrl).href : fileUrl))}" target="_blank" style="display: inline-block; font-size: 13px; color: #2563eb; font-weight: 600; text-decoration: underline;">
                        ⬇️ Download Attached File (${escapeHtml(fileName || "Download Attachment")})
                      </a>
                    </div>
                  </td>
                </tr>`
                    : ""
                }
                <tr>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0;">
                    <span style="display: block; font-size: 11px; text-transform: uppercase; font-weight: 700; color: #64748b; letter-spacing: 0.5px;">
                      🕒 Contribution Date & Time
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
                  <td style="padding: 14px 18px;">
                    <span style="display: block; font-size: 11px; text-transform: uppercase; font-weight: 700; color: #64748b; letter-spacing: 0.5px;">
                      🛡️ Current Approval Status
                    </span>
                    <span style="display: inline-block; background-color: ${isPending ? "#fef3c7" : "#ecfdf5"}; color: ${isPending ? "#b45309" : "#059669"}; border: 1px solid ${isPending ? "#fde68a" : "#a7f3d0"}; font-size: 12px; font-weight: 700; padding: 3px 10px; border-radius: 9999px; margin-top: 4px; text-transform: uppercase;">
                      ${isPending ? "⏳ Pending Administrator Approval" : "✓ Approved"}
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Call to Action -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <a href="${escapeHtml(targetPortalUrl)}" target="_blank" style="display: inline-block; background: #059669; color: #ffffff; font-weight: 700; font-size: 14px; text-decoration: none; padding: 13px 30px; border-radius: 6px; box-shadow: 0 3px 10px rgba(5, 150, 105, 0.35);">
                      Review &amp; Approve Resource in Admin Console →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; font-size: 12.5px; color: #64748b; text-align: center;">
                Click above to instantly review, approve, or reject this contribution from your Master Admin Console.
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
 * Dispatch notification email to Admin when someone contributes a resource
 * @param {Object} params
 * @param {string} params.name - Contributor's full name
 * @param {string} params.email - Contributor's email
 * @param {string} params.title - Resource title
 * @param {string} params.subject - Resource subject/discipline
 * @param {string} params.description - What they contributed (summary/notes)
 * @param {string} [params.fileUrl] - Uploaded file URL if any
 * @param {string} [params.fileName] - Uploaded original file name
 * @param {Date|string} [params.time] - Timestamp of contribution
 * @param {string} [params.id] - Resource unique ID
 * @param {string} [params.portalUrl] - Base portal URL
 * @param {string} [params.status] - Initial status (e.g., 'pending')
 */
async function sendAdminContributionNotification({ name, email, title, subject, description, fileUrl, fileName, time, id, portalUrl, status }) {
  const timeFormatted = formatRegistrationTime(time);
  const cleanName = String(name || "Student Contributor").trim();
  const cleanEmail = String(email || "student@portal.edu").trim();
  const cleanTitle = String(title || "Untitled Study Note").trim();
  const cleanSubject = String(subject || "General").trim();
  const cleanDesc = String(description || "Shared study material.").trim();
  const approvalStatus = status || "pending";

  const emailSubject = `🔔 New Resource Contributed (Approval Required): "${cleanTitle}" by ${cleanName}`;
  const textContent = `
[STUDENT STUDY RESOURCE PORTAL - RESOURCE CONTRIBUTION ALERT]
============================================================
A student has contributed new study material awaiting your approval.

• Contributor Name:        ${cleanName}
• Contributor Email:       ${cleanEmail}
• Contributed Resource:    ${cleanTitle}
• In Which Subject:        ${cleanSubject}
• What was Contributed:    ${cleanDesc}
${fileUrl ? `• Attached File:           ${fileName || "File"} (${fileUrl})\n` : ""}• Submission Date & Time:  ${timeFormatted.localFormatted}
• ISO Timestamp:           ${timeFormatted.isoFormatted}
• Moderation Status:       ${approvalStatus.toUpperCase()} (Pending Admin Approval)
${id ? `• Resource ID:             ${id}\n` : ""}
============================================================
Recipient Administrator:   ${ADMIN_EMAIL}
Review & Approve in Admin: ${portalUrl || "http://localhost:3000/#admin"}
============================================================
`.trim();

  const htmlContent = generateContributionAlertHTML({
    name: cleanName,
    email: cleanEmail,
    title: cleanTitle,
    subject: cleanSubject,
    description: cleanDesc,
    fileUrl,
    fileName,
    timeFormatted,
    id,
    portalUrl,
    status: approvalStatus
  });

  let notificationId = null;

  // 1. Record the notification in Neon DB
  try {
    const inserted = await sql`
      INSERT INTO admin_notifications (
        type, recipient, user_name, user_email, user_role, registered_at, status, details
      )
      VALUES (
        'resource_contributed',
        ${ADMIN_EMAIL},
        ${cleanName},
        ${cleanEmail},
        'contributor',
        ${timeFormatted.dateObj},
        'pending',
        ${JSON.stringify({
          resourceId: id || null,
          title: cleanTitle,
          subject: cleanSubject,
          summary: cleanDesc,
          fileUrl: fileUrl || null,
          fileName: fileName || null,
          approvalStatus: approvalStatus,
          isoTime: timeFormatted.isoFormatted
        })}
      )
      RETURNING id
    `;
    if (inserted && inserted.length > 0) {
      notificationId = inserted[0].id;
    }
  } catch (dbErr) {
    console.warn("Notice: Could not write contribution notification to database:", dbErr.message);
  }

  // 2. Check for configured SMTP Transporter
  const transporter = getTransporter();

  if (transporter) {
    try {
      const senderAddress = process.env.SMTP_FROM || process.env.SMTP_USER || process.env.EMAIL_USER || `"Study Portal Alerts" <${ADMIN_EMAIL}>`;
      const mailOptions = {
        from: senderAddress,
        to: ADMIN_EMAIL,
        subject: emailSubject,
        text: textContent,
        html: htmlContent
      };

      const info = await transporter.sendMail(mailOptions);

      console.log(`\n✓ [ADMIN CONTRIBUTION EMAIL SENT]`);
      console.log(`  To: ${ADMIN_EMAIL}`);
      console.log(`  Subject: ${emailSubject}`);
      console.log(`  Contributor: ${cleanName} <${cleanEmail}>`);
      console.log(`  Resource: ${cleanTitle} [${cleanSubject}]`);
      console.log(`  Time: ${timeFormatted.fullDisplay}`);
      console.log(`  Status: PENDING ADMIN APPROVAL\n`);

      if (notificationId) {
        await sql`UPDATE admin_notifications SET status = 'delivered', details = ${JSON.stringify({
          resourceId: id || null,
          title: cleanTitle,
          subject: cleanSubject,
          summary: cleanDesc,
          fileUrl: fileUrl || null,
          messageId: info.messageId,
          time: timeFormatted.isoFormatted
        })} WHERE id = ${notificationId}`.catch(() => {});
      }

      return {
        success: true,
        mode: "live_smtp",
        messageId: info.messageId,
        recipient: ADMIN_EMAIL,
        contributor: { name: cleanName, email: cleanEmail, time: timeFormatted.fullDisplay }
      };
    } catch (smtpErr) {
      console.error(`\n⚠ [ADMIN CONTRIBUTION EMAIL DELIVERY FAILED]`);
      console.error(`  Recipient: ${ADMIN_EMAIL}`);
      console.error(`  Error: ${smtpErr.message}\n`);

      if (notificationId) {
        await sql`UPDATE admin_notifications SET status = 'failed', details = ${JSON.stringify({ error: smtpErr.message })} WHERE id = ${notificationId}`.catch(() => {});
      }

      return {
        success: false,
        mode: "live_smtp_failed",
        error: smtpErr.message,
        recipient: ADMIN_EMAIL,
        contributor: { name: cleanName, email: cleanEmail, time: timeFormatted.fullDisplay }
      };
    }
  } else {
    // 3. Graceful Fallback: Console & Logged Notification
    console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║               🔔 NEW RESOURCE CONTRIBUTION PENDING APPROVAL                  ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ Recipient (Admin Email) : ${ADMIN_EMAIL.padEnd(50)} ║
║ Contributor Name        : ${cleanName.padEnd(50)} ║
║ Contributor Email       : ${cleanEmail.padEnd(50)} ║
║ Contributed Resource    : ${cleanTitle.substring(0, 50).padEnd(50)} ║
║ In Which Subject        : ${cleanSubject.substring(0, 50).padEnd(50)} ║
║ What Was Contributed    : ${cleanDesc.substring(0, 50).padEnd(50)} ║
║ Attached File           : ${(fileUrl || "None").substring(0, 50).padEnd(50)} ║
║ Contribution Time       : ${timeFormatted.localFormatted.padEnd(50)} ║
║ Approval Status         : PENDING ADMIN APPROVAL (Review in Admin Console)   ║
╚══════════════════════════════════════════════════════════════════════════════╝
    `);

    if (notificationId) {
      await sql`UPDATE admin_notifications SET status = 'logged', details = ${JSON.stringify({
        resourceId: id || null,
        title: cleanTitle,
        subject: cleanSubject,
        summary: cleanDesc,
        fileUrl: fileUrl || null,
        approvalStatus: approvalStatus,
        note: "Contribution logged. Provide SMTP_USER & SMTP_PASS in .env for external inbox delivery.",
        time: timeFormatted.isoFormatted
      })} WHERE id = ${notificationId}`.catch(() => {});
    }

    return {
      success: true,
      mode: "preview_logged",
      recipient: ADMIN_EMAIL,
      contributor: { name: cleanName, email: cleanEmail, time: timeFormatted.fullDisplay }
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
  sendAdminContributionNotification,
  sendTestNotification,
  setCustomTransporter,
  verifyTransporterConnection
};
