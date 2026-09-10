
import * as nodemailer from 'nodemailer';
import { AppError } from '../utils/AppError';

export class EmailService {
  private transporter: nodemailer.Transporter;
  private fromEmail: string;

  constructor() {
    this.fromEmail = process.env.SMTP_FROM || 'noreply@school-management.com';
    
    // Configuration du transporteur SMTP
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  /**
   * Envoyer un email de vérification OTP
   */
  async sendOtpEmail(email: string, otp: string, prenom: string): Promise<void> {
    const subject = '🔐 Vérification de votre compte - School Management';
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
            .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
            .content { background: white; padding: 30px; border-radius: 5px; margin-top: 20px; }
            .otp-code { font-size: 32px; font-weight: bold; color: #4CAF50; text-align: center; padding: 20px; background: #f0f0f0; border-radius: 5px; letter-spacing: 5px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏫 School Management</h1>
            </div>
            <div class="content">
              <h2>Bonjour ${prenom},</h2>
              <p>Merci de vous être inscrit sur School Management !</p>
              <p>Pour activer votre compte, veuillez utiliser le code de vérification ci-dessous :</p>
              <div class="otp-code">${otp}</div>
              <p><strong>Ce code est valable 15 minutes.</strong></p>
              <p>Si vous n'avez pas demandé cette vérification, ignorez cet email.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} School Management. Tous droits réservés.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail(email, subject, html);
  }

  /**
   * Envoyer un email de réinitialisation de mot de passe
   */
  async sendResetPasswordEmail(email: string, token: string, prenom: string): Promise<void> {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    const subject = '🔑 Réinitialisation de votre mot de passe - School Management';
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
            .header { background: #ff9800; color: white; padding: 20px; text-align: center; }
            .content { background: white; padding: 30px; border-radius: 5px; margin-top: 20px; }
            .button { display: inline-block; padding: 12px 24px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔑 Réinitialisation du mot de passe</h1>
            </div>
            <div class="content">
              <h2>Bonjour ${prenom},</h2>
              <p>Nous avons reçu une demande de réinitialisation de votre mot de passe.</p>
              <p>Cliquez sur le bouton ci-dessous pour réinitialiser votre mot de passe :</p>
              <div style="text-align: center;">
                <a href="${resetLink}" class="button">Réinitialiser mon mot de passe</a>
              </div>
              <p><strong>Ce lien est valable 24 heures.</strong></p>
              <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
              <hr>
              <p style="color: #999; font-size: 14px;">Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :</p>
              <p style="color: #666; font-size: 12px; word-break: break-all;">${resetLink}</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} School Management. Tous droits réservés.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail(email, subject, html);
  }

  /**
   * Envoyer un email de confirmation de changement de mot de passe
   */
  async sendPasswordChangedEmail(email: string, prenom: string): Promise<void> {
    const subject = '✅ Mot de passe modifié - School Management';
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
            .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
            .content { background: white; padding: 30px; border-radius: 5px; margin-top: 20px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Mot de passe modifié</h1>
            </div>
            <div class="content">
              <h2>Bonjour ${prenom},</h2>
              <p>Votre mot de passe a été modifié avec succès.</p>
              <p>Si vous n'êtes pas à l'origine de cette modification, veuillez contacter immédiatement l'administrateur.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} School Management. Tous droits réservés.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail(email, subject, html);
  }

  /**
   * Envoyer un email générique
   */
  private async sendEmail(to: string, subject: string, html: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.fromEmail,
        to,
        subject,
        html
      });
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
      throw new AppError('Erreur lors de l\'envoi de l\'email', 500);
    }
  }
}