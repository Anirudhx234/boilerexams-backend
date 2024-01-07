const resetPasswordTemplate = (resetLink: string) => {
    return `
    <!DOCTYPE html>
        <html lang="en">

        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Reset</title>
            <style>
                body {
                    font-family: 'Arial', sans-serif;
                    margin: 0;
                    padding: 0;
                    background-color: #f4f4f4;
                }
            
                .container {
                    max-width: 600px;
                    margin: 20px auto;
                    padding: 20px;
                    background-color: #ffffff;
                    border-radius: 5px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                }
            
                h1 {
                    color: #555555;
                    text-align: center;
                }
            
                .logo {
                
                    text-align: center;
                    margin-bottom: 20px;
                }
            
                p {
                    color: #555555;
                }
            
                .button-container {
                    text-align: center;
                }
            
                .button {
                    display: inline-block;
                    padding: 10px 20px;
                    background-color: #CEBA90;
                    border-radius: 5px;
                    transition: background-color 0.3s ease, color 0.3s ease;                
                }
            
                .button:hover {
                    background-color: #B7A784;
                }
            
                .footer {
                    margin-top: 20px;
                    text-align: center;
                    color: #555555;
                }
            </style>
        </head>
            
        <body>
            <div class="container">
                <div class="logo">
                    <img src="https://www.boilerexams.com/BoilerExamsLogoNew.png" alt="Boilerexams" width="225">
                </div>
                <p>Hello,</p>
                <p>You have requested to reset your password. Click the button below to reset it:</p>
                <div class="button-container">
                    <a style="color:black; text-decoration:none;" href="${resetLink}" class="button">Reset Password</a>
                </div>
                <p>If you did not request this, please ignore this email.</p>
                <div class="footer">
                    <p>Thank you,<br>The Boilerexams Team</p>
                </div>
            </div>
        </body>   
    </html>
`;
};

export default resetPasswordTemplate;