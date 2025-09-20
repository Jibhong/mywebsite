import { list } from '@vercel/blob';

export default async function handler(req, res) {
  try {
    res.status(200).text("OK");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
