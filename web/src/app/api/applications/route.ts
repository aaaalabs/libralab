import { NextResponse } from 'next/server';
import { RoomApplication } from '../../../types/room';
import nodemailer from 'nodemailer';

// Email-Konfiguration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL;

export async function POST(request: Request) {
  try {
    const application: RoomApplication = await request.json();

    // Validierung
    if (!application.roomId || !application.applicantName || !application.email) {
      return NextResponse.json(
        { error: 'Fehlende Pflichtfelder' },
        { status: 400 }
      );
    }

    // E-Mail an den Vermieter
    const landlordMailOptions = {
      from: process.env.SMTP_USER,
      to: NOTIFICATION_EMAIL,
      subject: `Neue Bewerbung für Zimmer ${application.roomId}`,
      html: `
        <h2>Neue Zimmerbewerbung</h2>
        <p><strong>Zimmer:</strong> ${application.roomId}</p>
        <p><strong>Name:</strong> ${application.applicantName}</p>
        <p><strong>E-Mail:</strong> ${application.email}</p>
        <p><strong>Telefon:</strong> ${application.phone}</p>
        <p><strong>Beruf:</strong> ${application.occupation}</p>
        <p><strong>Gewünschtes Einzugsdatum:</strong> ${application.moveInDate}</p>
        <p><strong>Nachricht:</strong></p>
        <p>${application.message}</p>
      `,
    };

    // E-Mail an den Bewerber
    const applicantMailOptions = {
      from: process.env.SMTP_USER,
      to: application.email,
      subject: 'Bestätigung deiner Zimmerbewerbung',
      html: `
        <h2>Vielen Dank für deine Bewerbung!</h2>
        <p>Wir haben deine Bewerbung für das Zimmer erhalten und werden sie sorgfältig prüfen.</p>
        <p>Wir melden uns in Kürze bei dir.</p>
        <br>
        <p><strong>Deine Angaben:</strong></p>
        <p>Name: ${application.applicantName}</p>
        <p>Gewünschtes Einzugsdatum: ${application.moveInDate}</p>
        <p>Beruf: ${application.occupation}</p>
      `,
    };

    // Sende beide E-Mails
    await Promise.all([
      transporter.sendMail(landlordMailOptions),
      transporter.sendMail(applicantMailOptions),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Application error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}
