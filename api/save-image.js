// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, get } from "firebase/database";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
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
    
        if (!imageUrl || x === undefined || y === undefined) {
            return res.status(400).json({ error: "Image URL and position are required" });
        }
    
        try {
            const dbRef = ref(database, "images");
            await push(dbRef, { url: imageUrl, x, y });
            console.log("Image saved:", { imageUrl, x, y });
            res.status(200).json({ success: true });
        } catch (error) {
            console.error("Error saving image:", error);
            res.status(500).json({ error: "Failed to save image" });
        }
    }
    
    if (req.method === "GET") {
        try {
            const dbRef = ref(database, "images");
            const snapshot = await get(dbRef);
    
            if (snapshot.exists()) {
                const data = snapshot.val();
                const images = Object.entries(data).map(([id, entry]) => ({
                    id,
                    url: entry.url,
                    x: entry.x,
                    y: entry.y
                }));
                res.status(200).json({ images });
            } else {
                res.status(200).json({ images: [] });
            }
        } catch (error) {
            console.error("Error fetching images:", error);
            res.status(500).json({ error: "Failed to fetch images" });
        }
    }
    

    res.status(405).json({ error: "Method not allowed" });
}