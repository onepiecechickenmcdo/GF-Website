import { NextResponse } from "next/server";
import { Resend } from "resend";

const baseStyle = `font-family:Georgia,serif;margin:0;padding:0;background-color:#fff0f5;`;
const footer = `<tr><td style="padding:16px 32px 24px;text-align:center;border-top:1px solid #ffe4e1;"><p style="margin:0;font-size:11px;color:#ddd;font-family:Arial,sans-serif;">Made with love, Kei 🌸</p></td></tr>`;

function wrapEmail(headerEmoji: string, headerTitle: string, headerSub: string, headerGradient: string, body: string) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="${baseStyle}">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#fff0f5;padding:40px 16px;">
  <tr><td align="center">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:24px;overflow:hidden;border:1px solid #ffe4e1;box-shadow:0 4px 30px rgba(255,133,161,0.12);">
      <tr><td style="background:${headerGradient};padding:40px 32px;text-align:center;">
        <p style="margin:0;font-size:52px;line-height:1;">${headerEmoji}</p>
        <h1 style="margin:12px 0 4px;color:#ffffff;font-size:20px;font-family:Georgia,serif;">${headerTitle}</h1>
        <p style="margin:0;color:rgba(255,255,255,0.85);font-size:12px;font-family:Arial,sans-serif;">${headerSub}</p>
      </td></tr>
      <tr><td style="padding:28px 32px 20px;">${body}</td></tr>
      ${footer}
    </table>
  </td></tr>
</table>
</body></html>`;
}

function ctaButton(label: string) {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin-top:22px;"><tr><td align="center"><a href="http://localhost:3000" style="display:inline-block;background:linear-gradient(135deg,#ff85a1,#ff6b95);color:#fff;text-decoration:none;font-family:Arial,sans-serif;font-size:13px;font-weight:bold;padding:13px 32px;border-radius:50px;box-shadow:0 4px 15px rgba(255,133,161,0.35);">${label}</a></td></tr></table>`;
}

export async function POST(req: Request) {
  try {
    const { email, role, sender, type, noteTitle, noteContent } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ simulated: true, message: "Email sending simulated! (Set RESEND_API_KEY in .env.local to send a real email)." });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const recipientName = role === "kei" ? "Kei" : "Cass";
    const senderName = sender || (role === "kei" ? "Cass" : "Kei");
    let subject = "";
    let html = "";

    if (type === "test") {
      subject = "💌 Test – Casstelle Check-In Notifications";
      html = wrapEmail("💖", "You're all set, " + recipientName + "!", "Your notifications are connected", "linear-gradient(135deg,#ff85a1 0%,#ffb6c1 100%)",
        `<p style="margin:0 0 16px;font-size:14px;color:#888;font-family:Arial,sans-serif;line-height:1.8;text-align:center;">
          This is a test email confirming your notifications<br>are set up and working perfectly.
        </p>${ctaButton("Open Our Space 💖")}`
      );

    } else if (type === "hug") {
      subject = `🤗 ${senderName} sent you a hug!`;
      html = wrapEmail("🤗", `${senderName} sent you a hug!`, "Thinking of you right now", "linear-gradient(135deg,#ffb6c1 0%,#ffdde6 100%)",
        `<p style="margin:0 0 20px;font-size:15px;color:#4a4a4a;font-family:Georgia,serif;line-height:1.9;text-align:center;">
          Hi ${recipientName},<br>
          ${senderName} just sent you a big warm hug.<br>
          <span style="font-size:13px;color:#aaa;font-style:italic;">I love you so much. 🌸</span>
        </p>${ctaButton("Open Our Space 💖")}`
      );

    } else if (type === "kiss") {
      subject = `😘 ${senderName} sent you a kiss!`;
      html = wrapEmail("😘", `${senderName} sent you a kiss!`, "A little reminder of my love", "linear-gradient(135deg,#ff85a1 0%,#ffb6c1 100%)",
        `<p style="margin:0 0 20px;font-size:15px;color:#4a4a4a;font-family:Georgia,serif;line-height:1.9;text-align:center;">
          Hi ${recipientName},<br>
          ${senderName} just sent you a sweet little kiss. 😘<br>
          <span style="font-size:13px;color:#aaa;font-style:italic;">Thinking of you right now. 💕</span>
        </p>${ctaButton("Open Our Space 💖")}`
      );

    } else if (type === "love_note") {
      subject = `💌 ${senderName} wrote you a love note!`;
      html = wrapEmail("💌", `${senderName} wrote you a love note!`, "Open it, it's just for you", "linear-gradient(135deg,#ff85a1 0%,#ffb347 100%)",
        `<p style="margin:0 0 20px;font-size:14px;color:#888;font-family:Arial,sans-serif;line-height:1.8;">Hi ${recipientName}, ${senderName} wrote you something. I hope it makes you smile. 🌸</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#fffdf6;border:2px solid #f5ebe0;border-radius:16px;margin-bottom:8px;">
          <tr><td style="padding:24px 28px;">
            <p style="margin:0 0 4px;font-size:10px;font-family:Arial,sans-serif;color:#ff85a1;font-weight:bold;letter-spacing:1px;text-transform:uppercase;">A note from ${senderName}</p>
            <h3 style="margin:0 0 14px;font-size:16px;color:#5c4033;font-family:Georgia,serif;border-bottom:1px solid #f5ebe0;padding-bottom:12px;">${noteTitle || "Just thinking of you 🌸"}</h3>
            <p style="margin:0;font-size:14px;color:#7a5c4a;font-family:Georgia,serif;line-height:1.9;font-style:italic;">"${noteContent || "Open the app to read my full note for you."}"</p>
          </td></tr>
        </table>
        ${ctaButton("Read My Note 💌")}`
      );

    } else if (type === "checkin_reminder") {
      subject = "❤️ It's time for your weekly check-in!";
      html = wrapEmail("📝", "Weekly Check-In Time", "It's time to reflect on our week together", "linear-gradient(135deg,#c94b6e 0%,#ff85a1 100%)",
        `<p style="margin:0 0 20px;font-size:16px;color:#4a4a4a;font-family:Georgia,serif;line-height:2;">
          Hi baby!<br><br>
          It's time for this week's check-in. Thank you for letting me read your thoughts and being honest with me. I appreciate you so much and I'll never want us any other way.<br><br>
          I love you!
        </p>
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff0f5;border-radius:16px;border:1px solid #ffe4e1;margin-bottom:8px;">
          <tr><td style="padding:20px 24px;">
            <p style="margin:0 0 12px;font-size:10px;font-family:Arial,sans-serif;color:#ff85a1;font-weight:bold;letter-spacing:1px;text-transform:uppercase;">This week's check-in includes</p>
            <p style="margin:4px 0;font-size:13px;color:#4a4a4a;font-family:Arial,sans-serif;">⭐ How did I do this week? (1–10)</p>
            <p style="margin:4px 0;font-size:13px;color:#4a4a4a;font-family:Arial,sans-serif;">❤️ What did I do to make you feel appreciated?</p>
            <p style="margin:4px 0;font-size:13px;color:#4a4a4a;font-family:Arial,sans-serif;">💭 What did I do that hurt you?</p>
            <p style="margin:4px 0;font-size:13px;color:#4a4a4a;font-family:Arial,sans-serif;">📷 Memory of the week (optional)</p>
            <p style="margin:4px 0;font-size:13px;color:#4a4a4a;font-family:Arial,sans-serif;">📓 Your personal journal entry</p>
          </td></tr>
        </table>
        ${ctaButton("Submit My Check-In 📝")}`
      );

    } else if (type === "checkin_submitted") {
      subject = "📝 Cass submitted her Weekly Check-In!";
      html = wrapEmail("📖", "Cass's check-in is ready!", "She took the time to reflect on your week together", "linear-gradient(135deg,#ff85a1 0%,#ffb6c1 50%,#ffc8d5 100%)",
        `<p style="margin:0 0 6px;font-size:18px;color:#4a4a4a;font-family:Georgia,serif;">Hi Kei,</p>
        <p style="margin:0 0 20px;font-size:14px;color:#888;font-family:Arial,sans-serif;line-height:1.8;">Cass has just submitted her <strong style="color:#ff85a1;">weekly check-in</strong>. She took the time to reflect on your relationship and share her honest thoughts with you. Head over to your dashboard to read it.</p>
        ${ctaButton("Open Dashboard 💖")}`
      );
    }

    const data = await resend.emails.send({
      from: "Casstelle <onboarding@resend.dev>",
      to: email,
      subject,
      html,
    });

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
