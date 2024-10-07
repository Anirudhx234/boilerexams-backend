const applicationTemplate = (id: string, name: string) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Application Received Confirmation</title>
        <style>
            body {
                font-family: 'Arial', sans-serif;
                margin: 0;
                padding: 0;
                background-color: #1B1B1B;
                color: #E8E8E8;
            }
            .email-container {
                max-width: 600px;
                margin: 40px auto;
                background: #2A2A2A;
                border: 1px solid #333;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            }
            .email-header {
                background-color: #333;
                color: #D0BA92;
                padding: 20px;
                text-align: center;
            }
            .email-body {
                padding: 20px;
                line-height: 1.5;
            }
            .highlight {
                color: #D0BA92;
            }
            .email-footer {
                text-align: center;
                padding: 10px;
                font-size: 0.8em;
                color: #E8E8E8;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="email-header">
                <h1>Application Received</h1>
            </div>
            <div class="email-body">
                <p>Dear ${name},</p>
                <p>Thank you for submitting your application. We have successfully received it and are looking forward to reviewing it. Below are the details of your submission:</p>
                <p><strong>Application ID:</strong> <span class="highlight">${id}</span></p>
                <p>We will be in touch shortly to proceed to the next steps. We appreciate your interest in joining our team!</p>
            </div>
            <div class="email-footer">
                This is an automated message. Please do not reply directly to this email.
            </div>
        </div>
    </body>
    </html>
    `;
};

export default applicationTemplate;
