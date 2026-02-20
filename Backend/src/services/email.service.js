require('dotenv').config();
const nodemailer = require('nodemailer');

const normalizeEnv = (value) => {
    if (typeof value !== 'string') return '';
    const trimmed = value.trim();
    if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
        return trimmed.slice(1, -1).trim();
    }
    return trimmed;
};

const EMAIL_USER = normalizeEnv(process.env.EMAIL_USER);
const EMAIL_PASS = normalizeEnv(process.env.EMAIL_PASS);
const CLIENT_ID = normalizeEnv(process.env.CLIENT_ID);
const CLIENT_SECRET = normalizeEnv(process.env.CLIENT_SECRET);
const REFRESH_TOKEN = normalizeEnv(process.env.REFRESH_TOKEN);
const emailAuthMode = normalizeEnv(process.env.EMAIL_AUTH_MODE).toLowerCase();

const hasOAuthConfig = Boolean(EMAIL_USER && CLIENT_ID && CLIENT_SECRET && REFRESH_TOKEN);
const hasAppPasswordConfig = Boolean(EMAIL_USER && EMAIL_PASS);

let transporter = null;
let selectedAuthMode = null;

if (emailAuthMode) {
    if ((emailAuthMode === 'oauth2' || emailAuthMode === 'oauth') && hasOAuthConfig) {
        selectedAuthMode = 'oauth2';
    } else if ((emailAuthMode === 'app-password' || emailAuthMode === 'app_password' || emailAuthMode === 'apppassword') && hasAppPasswordConfig) {
        selectedAuthMode = 'app-password';
    } else {
        const missingForOAuth = [
            !EMAIL_USER ? 'EMAIL_USER' : null,
            !CLIENT_ID ? 'CLIENT_ID' : null,
            !CLIENT_SECRET ? 'CLIENT_SECRET' : null,
            !REFRESH_TOKEN ? 'REFRESH_TOKEN' : null,
        ].filter(Boolean);

        const missingForAppPassword = [
            !EMAIL_USER ? 'EMAIL_USER' : null,
            !EMAIL_PASS ? 'EMAIL_PASS' : null,
        ].filter(Boolean);

        console.warn(
            `Email service is disabled: EMAIL_AUTH_MODE="${emailAuthMode}" does not match available credentials.` +
            ` Missing OAuth vars: [${missingForOAuth.join(', ') || 'none'}],` +
            ` Missing App-Password vars: [${missingForAppPassword.join(', ') || 'none'}].`
        );
    }
} else if (hasAppPasswordConfig) {
    selectedAuthMode = 'app-password';
} else if (hasOAuthConfig) {
    selectedAuthMode = 'oauth2';
}

if (selectedAuthMode === 'oauth2') {
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: EMAIL_USER,
            clientId: CLIENT_ID,
            clientSecret: CLIENT_SECRET,
            refreshToken: REFRESH_TOKEN,
        },
        connectionTimeout: 12000,
        greetingTimeout: 12000,
        socketTimeout: 15000,
    });
} else if (selectedAuthMode === 'app-password') {
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: EMAIL_USER,
            pass: EMAIL_PASS,
        },
        connectionTimeout: 12000,
        greetingTimeout: 12000,
        socketTimeout: 15000,
    });
}

if (transporter) {
    transporter.verify((error) => {
        if (error) {
            console.error('Email transporter verify failed:', error?.message || error);
        } else {
            console.log('Email server is ready to send messages using ' + selectedAuthMode);
        }
    });
} else {
    console.warn('Email service is disabled: provide EMAIL_USER + EMAIL_PASS or OAuth2 vars.');
}

// Function to send email
const sendEmail = async (to, subject, text, html) => {
    try {
        if (!transporter) {
            throw new Error('Email transporter is not configured');
        }

        const info = await transporter.sendMail({
            from: `"Secure Banking" <${process.env.EMAIL_USER}>`, // sender address
            to, // list of receivers
            subject, // Subject line
            text, // plain text body
            html, // html body
        });

        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        return info;
    } catch (error) {
        console.error('Error sending email:', error?.message || error);
        throw error;
    }
};

// Function to send registration email
// async function sendRegistrationEmail(to, name) {
//     const subject = 'Welcome to Secure Banking – Your Account is Ready';

//     const text = `
// Hi ${name},

// Welcome to Secure Banking! Your account has been successfully created.

// What you can do now:
// • Log in and complete your profile
// • Set up 2-factor authentication for extra security
// • Explore our digital banking features

// Security Tips:
// • Never share your OTP or password
// • Always verify emails claiming to be from us
// • Contact support if you notice suspicious activity

// Need Help?
// Email: support@securebank.com
// Phone: +91-000-000-0000

// Best Regards,
// Secure Banking Team
//     `; 

//     const html = `
//     <div style="font-family: Arial, sans-serif; background-color:#0b0f19; padding:30px; border-radius:12px; color:#d1d5db; max-width:600px; margin:auto; border:1px solid #1f2937; box-shadow:0 8px 25px rgba(0,0,0,0.6);">
//         <div style="max-width:600px; margin:auto; background:#121826; border-radius:12px; overflow:hidden; box-shadow:0 8px 25px rgba(0,0,0,0.6); border:1px solid #1f2937;">

//             <!-- Header -->
//             <div style="background:linear-gradient(90deg,#4c1d95,#6d28d9,#7c3aed,#a855f7); color:#f5f3ff; padding:28px; text-align:center;">
//                 <h1 style="margin:0; font-weight:600;">Secure Banking</h1>
//                 <p style="margin:6px 0 0; color:#ddd6fe;">Welcome to your digital banking space</p>
//             </div>

//             <!-- Body -->
//             <div style="padding:32px; color:#d1d5db;">

//                 <h2 style="margin-top:0; color:#f9fafb;">Hi ${name}, 👋</h2>

//                 <p style="line-height:1.6;">
//                     Thank you for registering with <strong style="color:#ffffff;">Secure Banking</strong>.
//                     Your account has been successfully created and is ready to use.
//                 </p>

//                 <!-- Divider -->
//                 <div style="height:1px; background:#1f2937; margin:25px 0;"></div>

//                 <h3 style="color:#f3f4f6;">🚀 Get Started</h3>
//                 <ul style="padding-left:18px; line-height:1.8; color:#9ca3af;">
//                     <li>Complete your profile details</li>
//                     <li>Enable Two-Factor Authentication (2FA)</li>
//                     <li>Explore transfers, bill payments, and digital services</li>
//                 </ul>

//                 <!-- CTA Button -->
//                 <div style="text-align:center; margin:35px 0;">
//                     <a href="#" style="
//                         background:linear-gradient(90deg,#7c3aed,#a855f7);
//                         color:white;
//                         padding:14px 30px;
//                         text-decoration:none;
//                         border-radius:8px;
//                         font-weight:600;
//                         display:inline-block;
//                         box-shadow:0 4px 14px rgba(168,85,247,0.5);
//                     ">
//                         Login to Your Account
//                     </a>
//                 </div>

//                 <!-- Security Box -->
//                 <div style="background:#0b1220; border:1px solid #1f2937; padding:18px; border-radius:8px; margin-top:25px;">
//                     <h3 style="margin-top:0; color:#f3f4f6;">🔒 Security Reminder</h3>
//                     <p style="margin-bottom:0; color:#9ca3af;">
//                         Never share your password or OTP with anyone. Our team will never ask for it.
//                     </p>
//                 </div>

//                 <!-- Support -->
//                 <div style="margin-top:30px;">
//                     <h3 style="color:#f3f4f6;">📞 Need Help?</h3>
//                     <p style="color:#9ca3af;">
//                         Email: support@securebank.com<br/>
//                         Phone: +91-000-000-0000
//                     </p>
//                 </div>

//                 <p style="margin-top:30px; color:#9ca3af;">
//                     We're excited to have you with us and look forward to serving your financial needs.
//                 </p>

//                 <p style="margin-top:25px;">
//                     <span style="color:#e5e7eb;">Best Regards,</span><br/>
//                     <strong style="color:#ffffff;">Secure Banking Team</strong>
//                 </p>

//             </div>

//             <!-- Footer -->
//             <div style="background:#0b0f19; text-align:center; padding:20px; font-size:12px; color:#6b7280; border-top:1px solid #1f2937;">
//                 <p style="margin:0;">© 2026 Secure Banking. All rights reserved.</p>
//                 <p style="margin:6px 0 0;">This is an automated message, please do not reply.</p>
//             </div>

//         </div>
//     </div>
//     `;

//     await sendEmail(to, subject, text, html);
// }

async function sendRegistrationEmail(to, name) {
    const subject = 'Welcome to Secure Banking – Your Account is Ready';

    const text = `
Hi ${name},

Welcome to Secure Banking! Your account has been successfully created.

What you can do now:
• Log in and complete your profile
• Set up 2-factor authentication for extra security
• Explore our digital banking features

Security Tips:
• Never share your OTP or password
• Always verify emails claiming to be from us
• Contact support if you notice suspicious activity

Need Help?
Email: support@securebank.com
Phone: +91-000-000-0000

Best Regards,
Secure Banking Team
    `;

    const html = `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0b0f19; padding:20px 10px; font-family:Arial, sans-serif;">
<tr>
<td align="center">

<!-- Card Container -->
<table width="100%" cellpadding="0" cellspacing="0" border="0"
style="max-width:600px; background:#121826; border-radius:12px; overflow:hidden; border:1px solid #1f2937;">

    <!-- Header -->
    <tr>
        <td align="center"
        style="padding:28px;
        background:linear-gradient(90deg,#4c1d95,#6d28d9,#7c3aed,#a855f7);
        color:#f5f3ff;">
            <h1 style="margin:0; font-weight:600;">Secure Banking</h1>
            <p style="margin:6px 0 0; color:#ddd6fe;">
                Welcome to your digital banking space
            </p>
        </td>
    </tr>

    <!-- Body -->
    <tr>
        <td style="padding:28px; color:#d1d5db;">

            <h2 style="margin-top:0; color:#f9fafb;">
                Hi ${name}, 👋
            </h2>

            <p style="line-height:1.6;">
                Thank you for registering with
                <strong style="color:#ffffff;">Secure Banking</strong>.
                Your account has been successfully created and is ready to use.
            </p>

            <!-- Divider -->
            <div style="height:1px; background:#1f2937; margin:25px 0;"></div>

            <h3 style="color:#f3f4f6;">🚀 Get Started</h3>
            <ul style="padding-left:18px; line-height:1.8; color:#9ca3af;">
                <li>Complete your profile details</li>
                <li>Enable Two-Factor Authentication (2FA)</li>
                <li>Explore transfers, bill payments, and digital services</li>
            </ul>

            <!-- CTA Button -->
            <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin:35px auto;">
                <tr>
                    <td align="center"
                    style="border-radius:8px;
                    background:linear-gradient(90deg,#7c3aed,#a855f7);">

                        <a href="#"
                        style="
                        display:inline-block;
                        padding:14px 30px;
                        color:#ffffff;
                        text-decoration:none;
                        font-weight:600;">
                        Login to Your Account
                        </a>

                    </td>
                </tr>
            </table>

            <!-- Security Box -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0"
            style="background:#0b1220; border:1px solid #1f2937; border-radius:8px; margin-top:25px;">
                <tr>
                    <td style="padding:18px;">
                        <h3 style="margin-top:0; color:#f3f4f6;">🔒 Security Reminder</h3>
                        <p style="margin-bottom:0; color:#9ca3af;">
                            Never share your password or OTP with anyone.
                            Our team will never ask for it.
                        </p>
                    </td>
                </tr>
            </table>

            <!-- Support -->
            <div style="margin-top:30px;">
                <h3 style="color:#f3f4f6;">📞 Need Help?</h3>
                <p style="color:#9ca3af;">
                    Email: support@securebank.com<br/>
                    Phone: +91-000-000-0000
                </p>
            </div>

            <p style="margin-top:30px; color:#9ca3af;">
                We're excited to have you with us and look forward to serving your financial needs.
            </p>

            <p style="margin-top:25px;">
                <span style="color:#e5e7eb;">Best Regards,</span><br/>
                <strong style="color:#ffffff;">Secure Banking Team</strong>
            </p>

        </td>
    </tr>

    <!-- Footer -->
    <tr>
        <td align="center"
        style="padding:20px;
        background:#0b0f19;
        font-size:12px;
        color:#6b7280;
        border-top:1px solid #1f2937;">
            <p style="margin:0;">© 2026 Secure Banking. All rights reserved.</p>
            <p style="margin:6px 0 0;">
                This is an automated message, please do not reply.
            </p>
        </td>
    </tr>

</table>

</td>
</tr>
</table>
`;

    await sendEmail(to, subject, text, html);
}

// async function sendTransactionEmail(to, name, amount, fromAccount, toAccount) { 
//     const subject = `Your transaction of ₹${amount} was successful`;
//     const text = `Hi ${name},\n\nYour transaction of ₹${amount} was successful.`;
//     const html = `
//         <table width="100%" cellpadding="0" cellspacing="0" border="0"
//         style="background:#111827; color:#f3f4f6; font-family:Arial, sans-serif;">
//             <tr>
//                 <td align="center">
//                     <table width="600" cellpadding="0" cellspacing="0" border="0"
//                     style="background:#1f2937; border-radius:8px;">
//                         <tr>
//                             <td style="padding:25px 35px;">
//                                 <h2 style="margin-top:0; color:#ffffff;">Transaction Successful</h2>
//                                 <p style="margin-bottom:0; color:#d1d5db;">
//                                     Hi ${name}, your transaction of ₹${amount} was successful.
//                                 </p>
//                             </td>
//                         </tr>
//                     </table>
//                 </td>
//             </tr>
//         </table>
//     `;
//     await sendEmail(to, subject, text, html);
// }

async function senderEmail(to, name, amount, toUser) {
    const subject = `Transaction Alert: ₹${amount} Debited Successfully`;

    const text = `
Dear ${name},

This is to inform you that a transaction of ₹${amount} has been successfully processed.

Beneficiary: ${toUser}

If you did not perform this transaction, please contact support immediately.

Secure Banking
    `;

    const html = `
<table width="100%" cellpadding="0" cellspacing="0" border="0"
style="background:#0b1120; padding:20px 10px; font-family:Arial, sans-serif;">

<tr>
<td align="center">

<table width="100%" cellpadding="0" cellspacing="0" border="0"
style="max-width:600px; background:#111827; border-radius:8px; border:1px solid #1f2937;">

    <!-- Header -->
    <tr>
        <td style="padding:20px 25px; border-bottom:1px solid #1f2937;">
            <h2 style="margin:0; color:#ffffff; font-size:20px;">
                Secure Banking
            </h2>
            <p style="margin:4px 0 0; color:#9ca3af; font-size:12px;">
                Transaction Notification
            </p>
        </td>
    </tr>

    <!-- Body -->
    <tr>
        <td style="padding:25px; color:#e5e7eb;">

            <p style="margin-top:0;">Dear ${name},</p>

            <p style="color:#d1d5db; line-height:1.6;">
                This is to inform you that the following transaction has been processed successfully.
            </p>

            <!-- Transaction Box -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0"
            style="margin:20px 0; background:#020617; border:1px solid #1f2937; border-radius:6px;">
                <tr>
                    <td style="padding:18px;">

                        <p style="margin:0; color:#9ca3af; font-size:12px;">
                            AMOUNT DEBITED
                        </p>

                        <p style="margin:6px 0 15px; font-size:26px; color:#22c55e; font-weight:bold;">
                            ₹${amount}
                        </p>

                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                                <td style="padding:6px 0; color:#9ca3af;">Transferred To</td>
                                <td align="right" style="color:#e5e7eb;">${toUser}</td>
                            </tr>

                            <tr>
                                <td style="padding:6px 0; color:#9ca3af;">Status</td>
                                <td align="right" style="color:#22c55e;">Successful</td>
                            </tr>

                            <tr>
                                <td style="padding:6px 0; color:#9ca3af;">Mode</td>
                                <td align="right" style="color:#e5e7eb;">Online Transfer</td>
                            </tr>
                        </table>

                    </td>
                </tr>
            </table>

            <!-- Security Notice -->
            <p style="color:#9ca3af; font-size:13px; line-height:1.6;">
                If you did not authorize this transaction, please contact our support team immediately.
                Never share your OTP, PIN, or password with anyone.
            </p>

            <p style="margin-top:25px;">
                Regards,<br>
                <strong style="color:#ffffff;">Secure Banking Team</strong>
            </p>

        </td>
    </tr>

    <!-- Footer -->
    <tr>
        <td align="center"
        style="padding:18px; border-top:1px solid #1f2937; color:#6b7280; font-size:12px;">
            This is an automated transaction alert. Please do not reply.
        </td>
    </tr>

</table>

</td>
</tr>
</table>
`;

    await sendEmail(to, subject, text, html);
}

async function receiverEmail(to, name, amount, fromUser) {
    const subject = `Credit Alert: ₹${amount} Received Successfully`;

    const text = `
Dear ${name},

This is to inform you that you have received ₹${amount} from ${fromUser}.

If this credit was not expected, please contact support.

Secure Banking
    `;

    const html = `
<table width="100%" cellpadding="0" cellspacing="0" border="0"
style="background:#0b1120; padding:20px 10px; font-family:Arial, sans-serif;">

<tr>
<td align="center">

<table width="100%" cellpadding="0" cellspacing="0" border="0"
style="max-width:600px; background:#111827; border-radius:8px; border:1px solid #1f2937;">

    <!-- Header -->
    <tr>
        <td style="padding:20px 25px; border-bottom:1px solid #1f2937;">
            <h2 style="margin:0; color:#ffffff; font-size:20px;">
                Secure Banking
            </h2>
            <p style="margin:4px 0 0; color:#9ca3af; font-size:12px;">
                Transaction Notification
            </p>
        </td>
    </tr>

    <!-- Body -->
    <tr>
        <td style="padding:25px; color:#e5e7eb;">

            <p style="margin-top:0;">Dear ${name},</p>

            <p style="color:#d1d5db; line-height:1.6;">
                This is to inform you that the following amount has been credited to your account.
            </p>

            <!-- Transaction Box -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0"
            style="margin:20px 0; background:#020617; border:1px solid #1f2937; border-radius:6px;">
                <tr>
                    <td style="padding:18px;">

                        <p style="margin:0; color:#9ca3af; font-size:12px;">
                            AMOUNT CREDITED
                        </p>

                        <p style="margin:6px 0 15px; font-size:26px; color:#22c55e; font-weight:bold;">
                            ₹${amount}
                        </p>

                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                                <td style="padding:6px 0; color:#9ca3af;">Received From</td>
                                <td align="right" style="color:#e5e7eb;">${fromUser}</td>
                            </tr>

                            <tr>
                                <td style="padding:6px 0; color:#9ca3af;">Status</td>
                                <td align="right" style="color:#22c55e;">Successful</td>
                            </tr>

                            <tr>
                                <td style="padding:6px 0; color:#9ca3af;">Mode</td>
                                <td align="right" style="color:#e5e7eb;">Online Transfer</td>
                            </tr>
                        </table>

                    </td>
                </tr>
            </table>

            <!-- Security Notice -->
            <p style="color:#9ca3af; font-size:13px; line-height:1.6;">
                For your safety, never share your OTP, PIN, or password with anyone.
                Bank officials will never ask for confidential credentials.
            </p>

            <p style="margin-top:25px;">
                Regards,<br>
                <strong style="color:#ffffff;">Secure Banking Team</strong>
            </p>

        </td>
    </tr>

    <!-- Footer -->
    <tr>
        <td align="center"
        style="padding:18px; border-top:1px solid #1f2937; color:#6b7280; font-size:12px;">
            This is an automated transaction alert. Please do not reply.
        </td>
    </tr>

</table>

</td>
</tr>
</table>
`;

    await sendEmail(to, subject, text, html);
}


async function sendTransactionfailedEmail(to, name, amount, type) {
    const subject = `Your ${type} of ₹${amount} failed`;
    const text = `Hi ${name},\n\nYour ${type} of ₹${amount} failed. Please try again.`;
    const html = `
        <table width="100%" cellpadding="0" cellspacing="0" border="0"
        style="background:#111827; color:#f3f4f6; font-family:Arial, sans-serif;">
            <tr>
                <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" border="0"
                    style="background:#1f2937; border-radius:8px;">
                        <tr>
                            <td style="padding:25px 35px;">
                                <h2 style="margin-top:0; color:#ffffff;">Transaction Failed</h2>
                                <p style="margin-bottom:0; color:#d1d5db;">
                                    Hi ${name}, your ${type} of ₹${amount} failed. Please try again.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    `;
    await sendEmail(to, subject, text, html);
}


module.exports = {
    sendRegistrationEmail,
    senderEmail,
    receiverEmail,
    sendTransactionfailedEmail
};

