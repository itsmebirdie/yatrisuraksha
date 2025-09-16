// server/index.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());              // allow local dev requests
app.use(bodyParser.json());

// In-memory mock data
let tourists = [
  { id: 't1', name: 'Alex', country: 'USA', score: 78, lat: 27.12, lng: 94.35, lastSeen: Date.now() - 1000*60*5 },
  { id: 't2', name: 'Priya', country: 'India', score: 62, lat: 26.95, lng: 94.4, lastSeen: Date.now() - 1000*60*20 },
];

let alerts = [
  { id: 'a1', time: Date.now() - 1000*60*120, message: 'Entered restricted zone', touristId: 't2' },
];

// Endpoints
app.get('/api/tourists', (req, res) => res.json(tourists));
app.get('/api/tourists/:id', (req, res) => {
  const t = tourists.find(x => x.id === req.params.id);
  if (!t) return res.status(404).json({ error: 'Not found' });
  res.json(t);
});
app.get('/api/alerts', (req, res) => res.json(alerts));

app.post('/api/alerts', (req, res) => {
  const { message, touristId } = req.body;
  const a = { id: uuidv4(), time: Date.now(), message, touristId };
  alerts.push(a);
  res.status(201).json(a);
});

app.post('/api/dispatch', (req, res) => {
  const { touristId } = req.body;
  console.log('Dispatch request for', touristId);
  res.json({ ok: true, message: 'Dispatch request (mock)' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
