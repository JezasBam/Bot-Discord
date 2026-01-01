import express from 'express';
const app = express();

app.get('/auth/callback', (req, res) => {
  const { code } = req.query;
  if (code) {
    console.log('🔗 Callback received, redirecting to backend...');
    res.redirect(`http://localhost:4000/api/auth/callback?code=${code}`);
  } else {
    console.log('❌ No code provided in callback');
    res.status(400).send('No code provided');
  }
});

app.listen(3001, () => {
  console.log('🔗 Callback server running on http://localhost:3001');
});
