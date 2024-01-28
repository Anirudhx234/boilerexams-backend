import nodemailer from "nodemailer";

type EmailOptions = {
    from: string;
    to: string;
    subject: string;
    text?: string;
    html?: any;
};

const sendEmail = async (options: EmailOptions) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        secure: process.env.NODE_ENV === "production",
        auth: {
            user: process.env.EMAIL_ADDRESS,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    const info = await transporter.sendMail(options);
    return true;
};

export default sendEmail;
