export default async function handler(req, res) {
    if (req.method === "POST") {
      const { imageUrl } = req.body;
  
      // Save the image URL to your database or file system
      console.log("Received image URL:", imageUrl);
  
      res.status(200).json({ message: "Image saved successfully!" });
    } else {
      res.status(405).json({ message: "Method not allowed" });
    }
  }
  