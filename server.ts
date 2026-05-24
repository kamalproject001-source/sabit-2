import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Initialize Gemini
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Lazy initialize Firebase Admin
let db: any = null;
function getDb() {
  if (!db) {
    try {
      if (process.env.FIREBASE_PROJECT_ID) {
        initializeApp({
          projectId: process.env.FIREBASE_PROJECT_ID,
        });
        db = getFirestore();
      }
    } catch (e) {
      console.error("Firebase Admin initialization failed", e);
    }
  }
  return db;
}

// In-memory fallback if Firebase is not connected
const memoryStore: any = {
  knowledge_base: [
    {
      id: "baduy",
      title: "Tata Ruang Baduy",
      category: "Kearifan Lokal",
      region: "Banten",
      description: "Sistem zonasi berbasis kosmologi: Reuma, Leuweung Kolot, dan Lembur.",
      content: "Masyarakat Baduy menerapkan 'lojor teu meunang dipotong, pondok teu meunang disambung'. Mereka membagi wilayah menjadi kawasan hunian (Lembur), kawasan lindung (Leuweung Kolot), dan kawasan budidaya (Reuma).",
      imageUrl: "/src/assets/images/local_wisdom_icon_1779174524440.png"
    },
    {
      id: "bali",
      title: "Tri Hita Karana",
      category: "Filosofi",
      region: "Bali",
      description: "Harmoni antara manusia, alam, dan pencipta.",
      content: "Dalam tata ruang Bali, konsep Sanga Mandala digunakan untuk menentukan tata letak bangunan berdasarkan arah mata angin dan tingkat kesakralan.",
      imageUrl: "https://images.unsplash.com/photo-1537996194471-e657df975ab4"
    },
    {
      id: "jawa",
      title: "Pancer Wolu",
      category: "Tata Kota",
      region: "Jawa Tengah",
      description: "Konsep tata kota tradisional berbasis poros imajiner dan sumbu filosofis.",
      content: "Kota-kota di Jawa seperti Yogyakarta dirancang berdasarkan poros utara-selatan (Gunung Merapi-Laut Selatan) yang melambangkan keseimbangan makrokosmos dan mikrokosmos.",
      imageUrl: "https://images.unsplash.com/photo-1596306499317-8490232098fa"
    },
    {
      id: "minang",
      title: "Luhak Nan Tigo",
      category: "Zonasi",
      region: "Sumatera Barat",
      description: "Sistem pembagian wilayah adat berbasis ketersediaan sumber daya alam.",
      content: "Masyarakat Minangkabau membagi wilayah menjadi Nagari, Koto, dan Ranah. Prinsip 'Alam Takambang Jadi Guru' mengarahkan pembangunan yang mengikuti kontur alam.",
      imageUrl: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2"
    }
  ],
  consultations: [],
  forum_posts: []
};

async function getAISmartRecommendation(question: string) {
  try {
    const model = "gemini-3-flash-preview";
    const systemInstruction = `Anda adalah asisten ahli tata ruang Nusantara bernama Tataruang.In. 
    Tugas Anda adalah memberikan rekomendasi awal pengelolaan tata ruang yang diintegrasikan dengan kearifan lokal Nusantara (seperti sistem Baduy, Bali, Jawa, dll).
    Berikan jawaban yang edukatif, berkelanjutan, dan menghargai budaya lokal.
    Format jawaban: Berikan ringkasan pendek dan poin-poin saran.`;

    const response = await ai.models.generateContent({
      model,
      contents: question,
      config: {
        systemInstruction,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API error:", error);
    return "Maaf, sistem AI sedang sibuk. Pakar manusia akan segera menjawab pertanyaan Anda.";
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/knowledge", async (req, res) => {
    const firestore = getDb();
    if (!firestore) return res.json(memoryStore.knowledge_base);

    try {
      const snapshot = await firestore.collection("knowledge_base").get();
      const list = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
      res.json(list.length > 0 ? list : memoryStore.knowledge_base);
    } catch (error: any) {
      res.json(memoryStore.knowledge_base);
    }
  });

  app.post("/api/consultation", async (req, res) => {
    const { name, email, question, category } = req.body;
    const firestore = getDb();
    
    // Get AI Recommendation
    const aiRecommendation = await getAISmartRecommendation(question);

    const newConsultation = {
      name,
      email,
      question,
      category,
      status: "pending",
      timestamp: firestore ? FieldValue.serverTimestamp() : new Date().toISOString(),
      aiResponse: aiRecommendation,
    };

    if (!firestore) {
      const entry = { id: Math.random().toString(36).substring(7), ...newConsultation };
      memoryStore.consultations.unshift(entry);
      return res.json({ success: true, id: entry.id, aiResponse: aiRecommendation });
    }

    try {
      const docRef = await firestore.collection("consultations").add(newConsultation);
      res.json({ success: true, id: docRef.id, aiResponse: aiRecommendation });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.get("/api/consultations", async (req, res) => {
    const firestore = getDb();
    if (!firestore) return res.json(memoryStore.consultations.slice(0, 10));

    try {
      const snapshot = await firestore
        .collection("consultations")
        .orderBy("timestamp", "desc")
        .limit(20)
        .get();
      const list = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
      res.json(list);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/answer", async (req, res) => {
    const { consultationId, answer, volunteerName } = req.body;
    const firestore = getDb();
    
    if (!firestore) {
      const consultation = memoryStore.consultations.find((c: any) => c.id === consultationId);
      if (consultation) {
        consultation.status = "answered";
        consultation.expertAnswer = answer;
        consultation.expertName = volunteerName;
        return res.json({ success: true });
      }
      return res.status(404).json({ error: "Not found" });
    }

    try {
      await firestore.collection("consultations").doc(consultationId).update({
        status: "answered",
        expertAnswer: answer,
        expertName: volunteerName,
        answeredAt: FieldValue.serverTimestamp(),
      });
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
