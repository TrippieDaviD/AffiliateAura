import { DubCoService } from "@/api/integrations";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { domain, key } = req.body;

    if (!domain || !key) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Call Dub.co API
    const response = await fetch(`https://api.dub.co/links/${domain}/${key}/stats`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${process.env.DUB_API_KEY}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch link stats');
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error in getLinkStats:', error);
    return res.status(500).json({ error: error.message });
  }
}