import nodemailer, { Transporter } from 'nodemailer';

export interface SendMailOptions {
    to: string | string[];
    subject: string;
    htmlBody: string;
    attachements?: Attachement[];
}

export interface Attachement {
    filename: string;
    path: string;
}

export class EmailService {

    private transporter: Transporter

    constructor(
        mailerServices: string,
        mailerEmail: string,
        senderEmailPassword: string,
        private readonly postToProvider: boolean,
    ){
        this.transporter = nodemailer.createTransport({
            service: mailerServices,
            auth: {
                user: mailerEmail,
                pass: senderEmailPassword,
            }
        });
    }

    async sendEmail(options: SendMailOptions): Promise<boolean> {

        const { to, subject, htmlBody, attachements = [] } = options;

        try {

            if ( !this.postToProvider ) return true;

            await this.transporter.sendMail({
                to: to,
                subject: subject,
                html: htmlBody,
                attachments: attachements,
            });

            return true;

        } catch (error) {
            return false;
        }
    }
}
