import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    // You can configure these in your .env later
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'test@example.com',
        pass: process.env.EMAIL_PASS || 'password',
    },
});

export const sendGoalMilestoneEmail = async (to: string, userName: string, goalTitle: string, milestone: number) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER || 'no-reply@pixelfi.com',
            to,
            subject: `🎉 Milestone Reached: ${milestone}% for your goal "${goalTitle}"!`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Congratulations ${userName || ''}!</h2>
                    <p>You have reached the <strong>${milestone}%</strong> milestone for your goal <strong>${goalTitle}</strong>.</p>
                    <p>Keep up the great work and continue investing in your future.</p>
                    <br/>
                    <p>Best,</p>
                    <p>The PixelFi Team</p>
                </div>
            `,
        };

        // Note: For actual sending to work, valid credentials are required in the environment variables.
        // We catch errors to prevent server crash if email fails.
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${to} for milestone ${milestone}%`);
    } catch (error) {
        console.error("Failed to send email:", error);
    }
};
