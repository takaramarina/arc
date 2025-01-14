// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
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
        const { imageUrl } = req.body;

        if (!imageUrl) {
            return res.status(400).json({ error: "Image URL is required" });
        }

        try {
            const dbRef = ref(database, "images");
            await push(dbRef, { url: imageUrl });
            console.log("Image saved:", imageUrl);
            res.status(200).json({ success: true });
        } catch (error) {
            console.error("Error saving image:", error);
            res.status(500).json({ error: "Failed to save image" });
        }
        return;
    }

    if (req.method === "GET") {
        try {
            const dbRef = ref(database, "images");
            const snapshot = await get(dbRef);

            if (snapshot.exists()) {
                const data = snapshot.val();
                const images = Object.values(data).map((entry) => entry.url);
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