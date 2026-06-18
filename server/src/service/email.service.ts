import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    // You can configure these in your .env later
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'test@example.com',
        pass: process.env.EMAIL_PASS || 'password',
    },
});

export const sendDailySnapshotEmail = async (
    to: string,
    userName: string,
    data: {
        netWorth: number;
        healthScore: number;
        totalAssets: number;
        totalLiabilities: number;
        date: string;
    }
) => {
    try {
        const healthColor = data.healthScore >= 70 ? '#22c55e' : data.healthScore >= 40 ? '#f59e0b' : '#ef4444';
        const mailOptions = {
            from: process.env.EMAIL_USER || 'no-reply@pixelfi.com',
            to,
            subject: `📊 Your Daily Financial Snapshot – ${data.date}`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #6366f1;">Daily Snapshot – ${data.date}</h2>
                    <p>Hi ${userName || 'there'},</p>
                    <p>Here's a quick look at your finances for today:</p>
                    <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
                        <tr style="background: #f8fafc;">
                            <td style="padding: 10px; border: 1px solid #e2e8f0;">Net Worth</td>
                            <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">₹${data.netWorth.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border: 1px solid #e2e8f0;">Total Assets</td>
                            <td style="padding: 10px; border: 1px solid #e2e8f0;">₹${data.totalAssets.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                        </tr>
                        <tr style="background: #f8fafc;">
                            <td style="padding: 10px; border: 1px solid #e2e8f0;">Total Liabilities</td>
                            <td style="padding: 10px; border: 1px solid #e2e8f0;">₹${data.totalLiabilities.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border: 1px solid #e2e8f0;">Health Score</td>
                            <td style="padding: 10px; border: 1px solid #e2e8f0; color: ${healthColor}; font-weight: bold;">${data.healthScore} / 100</td>
                        </tr>
                    </table>
                    <p style="color: #64748b; font-size: 13px;">Log in to PixelFi for your full dashboard and insights.</p>
                    <br/>
                    <p>Best,</p>
                    <p>The PixelFi Team</p>
                </div>
            `,
        };
        await transporter.sendMail(mailOptions);
        console.log(`Daily snapshot email sent to ${to}`);
    } catch (error) {
        console.error('Failed to send daily snapshot email:', error);
    }
};

export const sendMonthlyReportEmail = async (
    to: string,
    userName: string,
    data: {
        month: string;
        netWorth: number;
        monthlyIncome: number;
        monthlyExpenses: number;
        savingsRate: number;
        healthScore: number;
        netWorthMoM: number | null;
        insightCount: number;
        summary: string | null;
    }
) => {
    try {
        const healthColor = data.healthScore >= 70 ? '#22c55e' : data.healthScore >= 40 ? '#f59e0b' : '#ef4444';
        const momSign = data.netWorthMoM !== null && data.netWorthMoM >= 0 ? '+' : '';
        const mailOptions = {
            from: process.env.EMAIL_USER || 'no-reply@pixelfi.com',
            to,
            subject: `📅 Your Monthly Financial Report – ${data.month}`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #6366f1;">Monthly Report – ${data.month}</h2>
                    <p>Hi ${userName || 'there'},</p>
                    <p>Your monthly financial snapshot is ready. Here's a summary of how you did this month:</p>
                    <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
                        <tr style="background: #f8fafc;">
                            <td style="padding: 10px; border: 1px solid #e2e8f0;">Net Worth</td>
                            <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">₹${data.netWorth.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border: 1px solid #e2e8f0;">Net Worth MoM</td>
                            <td style="padding: 10px; border: 1px solid #e2e8f0; color: ${data.netWorthMoM !== null && data.netWorthMoM >= 0 ? '#22c55e' : '#ef4444'}; font-weight: bold;">${data.netWorthMoM !== null ? `${momSign}${data.netWorthMoM}%` : 'N/A'}</td>
                        </tr>
                        <tr style="background: #f8fafc;">
                            <td style="padding: 10px; border: 1px solid #e2e8f0;">Monthly Income</td>
                            <td style="padding: 10px; border: 1px solid #e2e8f0;">₹${data.monthlyIncome.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border: 1px solid #e2e8f0;">Monthly Expenses</td>
                            <td style="padding: 10px; border: 1px solid #e2e8f0;">₹${data.monthlyExpenses.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                        </tr>
                        <tr style="background: #f8fafc;">
                            <td style="padding: 10px; border: 1px solid #e2e8f0;">Savings Rate</td>
                            <td style="padding: 10px; border: 1px solid #e2e8f0;">${data.savingsRate.toFixed(1)}%</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border: 1px solid #e2e8f0;">Health Score</td>
                            <td style="padding: 10px; border: 1px solid #e2e8f0; color: ${healthColor}; font-weight: bold;">${data.healthScore} / 100</td>
                        </tr>
                        ${data.insightCount > 0 ? `
                        <tr style="background: #f8fafc;">
                            <td style="padding: 10px; border: 1px solid #e2e8f0;">AI Insights Generated</td>
                            <td style="padding: 10px; border: 1px solid #e2e8f0;">${data.insightCount} new insight${data.insightCount > 1 ? 's' : ''}</td>
                        </tr>` : ''}
                    </table>
                    ${data.summary ? `<div style="background: #f1f5f9; border-left: 4px solid #6366f1; padding: 12px 16px; margin: 16px 0; border-radius: 4px;"><p style="margin: 0; color: #334155;">${data.summary}</p></div>` : ''}
                    <p style="color: #64748b; font-size: 13px;">Log in to PixelFi to view your full report, AI recommendations, and portfolio breakdown.</p>
                    <br/>
                    <p>Best,</p>
                    <p>The PixelFi Team</p>
                </div>
            `,
        };
        await transporter.sendMail(mailOptions);
        console.log(`Monthly report email sent to ${to} for ${data.month}`);
    } catch (error) {
        console.error('Failed to send monthly report email:', error);
    }
};

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
