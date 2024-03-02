import * as nodemailer from "nodemailer";

const Account = '"No Reply" <noreply@boilerexams.com>';

type TransporterEmailOptions = {
    from: string;
    to: string;
    subject: string;
    text?: string;
    html?: any;
};

type EmailOptions = {
    to: string;
    subject: string;
    text?: string;
    html?: string;
}
const transporter = nodemailer.createTransport({
    host: "backend.boilerexams.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASSWORD,
    },
});

transporter.verify(function (error, success) {
    if (error) {
        console.log(`User ${process.env.EMAIL_ADDRESS}, Password: ${process.env.EMAIL_PASSWORD}`)
        console.log(error);
    } else {
        console.log("Server is ready to take our messages");
    }
});

const createOptions = (options: EmailOptions): TransporterEmailOptions => {
    const op = {
        from: Account,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
    }
    return op;
}

const sendEmail = async (options: EmailOptions) => {
    const op = createOptions(options);
    const info = await transporter.sendMail(op);
    return true;
};


export default sendEmail;
