import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, get, update } from "firebase/database";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAxpb0oVMGgH4swqUckNcp2rwmDGsuvObo",
  authDomain: "archive-2b54e.firebaseapp.com",
  databaseURL: "https://archive-2b54e-default-rtdb.firebaseio.com",
  projectId: "archive-2b54e",
  storageBucket: "archive-2b54e.firebasestorage.app",
  messagingSenderId: "1015482915954",
  appId: "1:1015482915954:web:5ab96c91684ed85a1f36eb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        res.status(200).end();
        return;
    }

    if (req.method === "POST") {
        const { imageUrl, x, y } = req.body;

        if (!imageUrl) {
            return res.status(400).json({ error: "Image URL is required" });
        }

        // Ensure x and y are valid, otherwise set default values
        const xPosition = typeof x === 'number' ? x : 100;
        const yPosition = typeof y === 'number' ? y : 100;

        try {
            const dbRef = ref(database, "images");
            const snapshot = await get(dbRef);
            
            let imageKey = null;
            let images = snapshot.exists() ? snapshot.val() : {};
            
            // Check if the image already exists in the database
            for (const key in images) {
                if (images[key].url === imageUrl) {
                    imageKey = key;
                    break;
                }
            }

            if (imageKey) {
                // Update position if image exists
                await update(ref(database, `images/${imageKey}`), { x: xPosition, y: yPosition });
                console.log("Updated image position:", imageUrl, xPosition, yPosition);
                res.status(200).json({ success: true, message: "Image position updated" });
            } else {
                // Add new image if it doesn't exist
                await push(dbRef, { url: imageUrl, x: xPosition, y: yPosition });
                console.log("Image saved:", imageUrl, xPosition, yPosition);
                res.status(200).json({ success: true, message: "New image saved" });
            }
        } catch (error) {
            console.error("Error saving/updating image:", error);
            res.status(500).json({ error: "Failed to save/update image" });
        }
        return;
    }

    if (req.method === "GET") {
        try {
            const dbRef = ref(database, "images");
            const snapshot = await get(dbRef);

            if (snapshot.exists()) {
                const data = snapshot.val();
                const images = Object.keys(data).map((key) => ({
                    id: key, // Store ID to update later
                    url: data[key].url,
                    x: data[key].x || 100, // Default position if missing
                    y: data[key].y || 100
                }));
                res.status(200).json({ images });
            } else {
                res.status(200).json({ images: [] });
            }
        } catch (error) {
            console.error("Error fetching images:", error);
            res.status(500).json({ error: "Failed to fetch images" });
        }
        return;
    }

    res.status(405).json({ error: "Method not allowed" });
}
