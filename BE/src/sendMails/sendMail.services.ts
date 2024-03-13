import nodemailer from 'nodemailer'

export async function sendEmail(email: string, verify_token: string) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  })

  await transporter.sendMail(
    {
      from: `${process.env.EMAIL_USER}`,
      to: `${email}`,
      subject: '[FU-Furniture] Please Verify Your Email 🔑 🎉',
      html: `<p style="color: black">Hi there,<br>
      We requires a verified email address so you can take full advantage of [FU-Furniture]'s website features - and so you can safely recover your account in the future.</p>
      <br>
      <button style="
        position: relative;
        padding: 10px 22px;
        border-radius: 6px;
        border: none;
        color: #fff;
        cursor: pointer;
        background-color: #7d2ae8;
        text-decoration: none;
        transition: all 0.2s ease;">
        <a style="text-decoration: none; color: white" href="${process.env.DB_HOST}/users/verify-email?token=${verify_token}">Verify Email Address</a>
      </button>`
    },
    (error) => {
      if (error) {
        console.log(error)
        throw new Error('Error sending email')
      }
    }
  )
}
