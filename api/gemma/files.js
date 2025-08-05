export default async function handler(req, res) {
  const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
  const GOOGLE_FILES_API = "https://generativelanguage.googleapis.com/v1beta/files";

  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Goog-Upload-Protocol');

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
    // 构建Google AI Studio Files API URL
    const apiUrl = `${GOOGLE_FILES_API}?key=${GOOGLE_API_KEY}`;
    
    // 转发请求到Google AI Studio Files API
    const googleRes = await fetch(apiUrl, {
      method: "POST",
      headers: {
        'X-Goog-Upload-Protocol': 'multipart'
      },
      body: req.body // 直接转发FormData
    });

    if (!googleRes.ok) {
      const errorText = await googleRes.text();
      console.error('Google AI Studio Files API Error:', errorText);
      return res.status(googleRes.status).json({ 
        error: "Google AI Studio Files API error", 
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