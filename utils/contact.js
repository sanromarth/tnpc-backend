const nodemailer = require("nodemailer");

function getContactEmailHTML({ name, email, phone, subject, message }) {
    const subjectLabels = {
        placement: "Placement Inquiry",
        recruitment: "Recruitment Partnership",
        certification: "Certification Programs",
        mou: "MoU / Partnership",
        callback: "Request Callback",
        other: "Other"
    };
    const subjectLabel = subjectLabels[subject] || subject;

    return `<div style="font-family:'Inter',Arial,sans-serif;max-width:540px;margin:0 auto;background:#0B1D3A;border-radius:16px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#1e4f9a,#0B1D3A);padding:28px 24px;text-align:center;">
            <h1 style="color:#FBC02D;font-size:20px;margin:0 0 4px;">📬 New Contact Form Message</h1>
            <p style="color:rgba(255,255,255,0.6);font-size:13px;margin:0;">TNPC Portal — Sri GCSR College</p>
        </div>
        <div style="padding:24px;">
            <table style="width:100%;border-collapse:collapse;">
                <tr>
                    <td style="color:rgba(255,255,255,0.5);font-size:13px;padding:8px 0;font-weight:600;width:100px;">Name</td>
                    <td style="color:#fff;font-size:14px;padding:8px 0;">${name}</td>
                </tr>
                <tr>
                    <td style="color:rgba(255,255,255,0.5);font-size:13px;padding:8px 0;font-weight:600;">Email</td>
                    <td style="color:#FBC02D;font-size:14px;padding:8px 0;"><a href="mailto:${email}" style="color:#FBC02D;text-decoration:none;">${email}</a></td>
                </tr>
                <tr>
                    <td style="color:rgba(255,255,255,0.5);font-size:13px;padding:8px 0;font-weight:600;">Phone</td>
                    <td style="color:#fff;font-size:14px;padding:8px 0;">${phone || "Not provided"}</td>
                </tr>
                <tr>
                    <td style="color:rgba(255,255,255,0.5);font-size:13px;padding:8px 0;font-weight:600;">Subject</td>
                    <td style="color:#fff;font-size:14px;padding:8px 0;">${subjectLabel}</td>
                </tr>
            </table>
            <div style="margin-top:16px;padding:16px;background:rgba(255,255,255,0.06);border-radius:10px;border-left:3px solid #FBC02D;">
                <p style="color:rgba(255,255,255,0.5);font-size:12px;margin:0 0 6px;font-weight:600;">MESSAGE</p>
                <p style="color:#fff;font-size:14px;line-height:1.7;margin:0;white-space:pre-wrap;">${message}</p>
            </div>
        </div>
        <div style="background:rgba(255,255,255,0.03);padding:14px 24px;text-align:center;">
            <p style="color:rgba(255,255,255,0.3);font-size:11px;margin:0;">Reply directly to this email to respond to ${name}</p>
        </div>
    </div>`;
}

async function sendContactEmail(data) {
    console.log(`[CONTACT] Sending contact message from: ${data.name} (${data.email})`);

    const recipientEmail = process.env.CONTACT_EMAIL || process.env.SMTP_EMAIL || "sgcsrc.tnpc@gmail.com";
    const senderName = "TNPC Portal Contact Form";
    const subject = `New Contact: ${data.name} — ${data.subject}`;
    const htmlContent = getContactEmailHTML(data);

    // Try Brevo API first
    const brevoKey = process.env.BREVO_API_KEY || process.env.EMAIL_PASS;
    if (brevoKey) {
        try {
            const senderEmail = process.env.SMTP_EMAIL || "sgcsrc.tnpc@gmail.com";
            const payload = {
                sender: { name: senderName, email: senderEmail },
                to: [{ email: recipientEmail }],
                replyTo: { email: data.email, name: data.name },
                subject: subject,
                htmlContent: htmlContent
            };

            const response = await fetch("https://api.brevo.com/v3/smtp/email", {
                method: "POST",
                headers: {
                    "accept": "application/json",
                    "api-key": brevoKey,
                    "content-type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                console.log("[CONTACT] ✅ Sent via Brevo API");
                return { success: true };
            }
        } catch (err) {
            console.error("[CONTACT] Brevo API failed:", err.message);
        }
    }

    // Fallback: Brevo SMTP
    const host = process.env.EMAIL_HOST;
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;
    if (host && user && pass) {
        try {
            const port = parseInt(process.env.EMAIL_PORT || "587");
            const transporter = nodemailer.createTransport({
                host, port, secure: port === 465,
                auth: { user, pass },
                connectionTimeout: 30000, greetingTimeout: 30000, socketTimeout: 30000
            });

            await transporter.sendMail({
                from: `"${senderName}" <${user}>`,
                to: recipientEmail,
                replyTo: data.email,
                subject, html: htmlContent
            });
            console.log("[CONTACT] ✅ Sent via Brevo SMTP");
            return { success: true };
        } catch (err) {
            console.error("[CONTACT] Brevo SMTP failed:", err.message);
        }
    }

    // Fallback: Gmail SMTP
    const gmailUser = process.env.SMTP_EMAIL;
    const gmailPass = process.env.SMTP_PASSWORD;
    if (gmailUser && gmailPass) {
        try {
            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: { user: gmailUser, pass: gmailPass },
                connectionTimeout: 15000, greetingTimeout: 15000, socketTimeout: 15000
            });

            await transporter.sendMail({
                from: `"${senderName}" <${gmailUser}>`,
                to: recipientEmail,
                replyTo: data.email,
                subject, html: htmlContent
            });
            console.log("[CONTACT] ✅ Sent via Gmail SMTP");
            return { success: true };
        } catch (err) {
            console.error("[CONTACT] Gmail SMTP failed:", err.message);
        }
    }

    return { success: false, error: "All email methods failed" };
}

module.exports = { sendContactEmail };
