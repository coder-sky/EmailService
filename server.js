const express = require('express');
const EmailService = require('./service');
const app = express();
app.use(express.json())

const PORT = 8000;
const emailService = new EmailService();

app.post('/send-email', (req, res) => {
  // console.log(req.body)
  const email = req.body;
  if (!email.recipient || !email.subject || !email.body) {
    return res.status(400).json({ error: 'Invalid email payload' });
  }

  const result = emailService.sendMail(email)
  res.json(result); // Immediately return the queued status
});

app.get('/report-summery', (req, res) => {
  //res.send(Object.fromEntries(emailService.mailStatus))
  res.send(emailService.reportSummery)
})

app.listen(PORT, () => {
  console.log(`Backend is running at http://localhost:${PORT}`)
})
