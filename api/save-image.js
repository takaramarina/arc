import { kv } from '@vercel/kv';

export default async function handler(req, res) {
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

        // Save the image URL to Vercel KV
        const images = (await kv.get('images')) || [];
        images.push(imageUrl);
        await kv.set('images', images);

        console.log("Image saved:", imageUrl);
        return res.status(200).json({ success: true });
    }

    if (req.method === "GET") {
        // Retrieve all stored image URLs from Vercel KV
        const images = (await kv.get('images')) || [];
        return res.status(200).json({ images });
    }

    return res.status(405).json({ error: "Method not allowed" });
}
