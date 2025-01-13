import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'imageDatabase.json');

export default function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        res.status(200).end();
        return;
    }

    if (req.method === "POST") {
        const { imageUrl } = req.body;

        if (!imageUrl) {
            return res.status(400).json({ error: "Image URL is required" });
        }

        // Load existing data
        let imageDatabase = [];
        if (fs.existsSync(filePath)) {
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            imageDatabase = JSON.parse(fileContent);
        }

        // Add new image URL and save to file
        imageDatabase.push(imageUrl);
        fs.writeFileSync(filePath, JSON.stringify(imageDatabase, null, 2));
        console.log("Image saved:", imageUrl);

        return res.status(200).json({ success: true });
    }

    if (req.method === "GET") {
        // Load and return stored image URLs
        if (fs.existsSync(filePath)) {
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            const imageDatabase = JSON.parse(fileContent);
            return res.status(200).json({ images: imageDatabase });
        }

        return res.status(200).json({ images: [] });
    }

    return res.status(405).json({ error: "Method not allowed" });
}
