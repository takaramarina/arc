export default function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*"); // Allow all origins (or restrict as needed)
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  
    let imageDatabase = []; // Temporary in-memory storage

    if (req.method === "OPTIONS") {
      res.status(200).end();
      return;
    }
    if (req.method === "POST") {
        const { imageUrl } = req.body;
    
        if (!imageUrl) {
          return res.status(400).json({ error: "Image URL is required" });
        }
    
        imageDatabase.push(imageUrl); // Save image URL in memory
        console.log("Image saved:", imageUrl);
    
        return res.status(200).json({ success: true });
      }
    
      if (req.method === "GET") {
        // Return all stored image URLs
        return res.status(200).json({ images: imageDatabase });
      }
    
      return res.status(405).json({ error: "Method not allowed" });
  }
  