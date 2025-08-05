export default async function handler(req, res) {
  const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
  const GOOGLE_API_BASE = "https://generativelanguage.googleapis.com/v1beta";

  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  if (!GOOGLE_API_KEY) {
    return res.status(500).json({ error: "GOOGLE_API_KEY not configured" });
  }

  try {
    // 构建Google AI Studio API URL
    const apiUrl = `${GOOGLE_API_BASE}/models/gemma-3-27b-it:generateContent?key=${GOOGLE_API_KEY}`;
    
    const googleRes = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(req.body)
    });

    if (!googleRes.ok) {
      const errorText = await googleRes.text();
      console.error('Google AI Studio API Error:', errorText);
      return res.status(googleRes.status).json({ 
        error: "Google AI Studio API error", 
        details: errorText 
      });
    }

    const result = await googleRes.json();
    return res.status(200).json(result);
  } catch (e) {
    console.error('Server error:', e);
    return res.status(500).json({ error: "Server error", details: e.message });
  }
}