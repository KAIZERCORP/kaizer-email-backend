import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';

const app = express();
app.use(cors());

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, file.originalname),
});
const upload = multer({ storage });

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your.email@gmail.com',      // Replace with your Gmail
    pass: 'your-app-password',         // Gmail App Password
  },
});

app.post('/send-email', upload.array('attachments'), async (req, res) => {
  const { message, name, recipients } = req.body;
  const files = req.files || [];

  const finalMessage = name ? `From: ${name}\n\n${message}` : message;

  try {
    await transporter.sendMail({
      from: 'your.email@gmail.com',
      to: recipients.split(','),
      subject: 'New Message from Web Form',
      text: finalMessage,
      attachments: files.map(file => ({
        filename: file.originalname,
        path: file.path
      }))
    });

    // Delete uploaded files after sending
    files.forEach(file => fs.unlinkSync(file.path));

    res.send({ success: true });
  } catch(err) {
    console.error(err);
    res.status(500).send({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Email server running on port ${PORT}`));
