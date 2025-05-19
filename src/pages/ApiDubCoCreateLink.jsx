import { DubCoService } from "@/api/integrations";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url, domain, key, title, description } = req.body;

    // Call Dub.co API
    const response = await fetch('https://api.dub.co/links', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DUB_API_KEY}`
      },
      body: JSON.stringify({
        url,
        domain,
        key,
        title: title || 'Affiliate Link',
        description: description || '',
        archived: false,
        expiresAt: null,
        password: null,
        rewrite: false,
        ios: null,
        android: null,
        geo: {}
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create short link');
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error in createShortLink:', error);
    return res.status(500).json({ error: error.message });
  }
}