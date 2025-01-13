export default function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*"); // Allow all origins (or restrict as needed)
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  
    if (req.method === "OPTIONS") {
      res.status(200).end();
      return;
    }
  
    if (req.method === "POST") {
      const { imageUrl } = req.body;
  
      console.log("Received image URL:", imageUrl);
      res.status(200).json({ success: true });
    } else {
      res.status(405).json({ error: "Method not allowed" });
    }
  }
  