const dayOptions = [
  { label: 'Day 1 (Chest)', value: 'Day 1' },
  { label: 'Day 2 (Legs)', value: 'Day 2' },
  { label: 'Day 3 (Delts + Arms)', value: 'Day 3' },
  { label: 'Day 4 (Back)', value: 'Day 4' },
  { label: 'Abs (Any Day)', value: 'Abs' },
];

export default function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json(dayOptions);
  }

  res.status(405).json({ message: 'Method not allowed' });
}
