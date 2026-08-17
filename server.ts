import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK lazily / safely
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Cognitive Bloom level helper for fallback
function fallbackBloomAnalysis(topic: string, text: string, postType: string) {
  const lower = text.toLowerCase();
  let level = "Memahami (C2)";
  let code = "C2";
  let explanation =
    "Postingan mengeksplorasi konsep dasar dan penjelasan materi diskusi.";

  if (
    lower.includes("buatlah") ||
    lower.includes("rancang") ||
    lower.includes("ide baru") ||
    lower.includes("sintesis") ||
    lower.includes("kembangkan strategi")
  ) {
    level = "Menciptakan (C6)";
    code = "C6";
    explanation =
      "Mahasiswa menyusun rancangan atau solusi pembelajaran orisinal yang baru.";
  } else if (
    lower.includes("kritik") ||
    lower.includes("evaluasi") ||
    lower.includes("efektivitas") ||
    lower.includes("kelebihan dan kekurangan") ||
    lower.includes("menurut pendapat saya")
  ) {
    level = "Mengevaluasi (C5)";
    code = "C5";
    explanation =
      "Mahasiswa memberikan pertimbangan kritis dan evaluasi terhadap validitas atau efektivitas konsep.";
  } else if (
    lower.includes("analisis") ||
    lower.includes("bandingkan") ||
    lower.includes("perbedaan") ||
    lower.includes("korelasikan") ||
    lower.includes("mengapa terjadi")
  ) {
    level = "Menganalisis (C4)";
    code = "C4";
    explanation =
      "Mahasiswa mengurai struktur argumen, membandingkan komponen, atau meneliti hubungan sebab-akibat.";
  } else if (
    lower.includes("terapkan") ||
    lower.includes("aplikasikan") ||
    lower.includes("implementasi") ||
    lower.includes("contoh kasus") ||
    lower.includes("bagaimana cara mengajar")
  ) {
    level = "Menerapkan (C3)";
    code = "C3";
    explanation =
      "Mahasiswa mengaitkan teori dengan skenario praktis dan implementasi pembelajaran nyata.";
  } else if (
    lower.includes("apa itu") ||
    lower.includes("siapa") ||
    lower.includes("sebutkan") ||
    lower.includes("kapan") ||
    lower.includes("definisi")
  ) {
    level = "Memahami (C2)";
    code = "C2";
    explanation =
      "Pertanyaan mahasiswa meminta penjelasan konsep, identifikasi tokoh, dan makna dasar materi.";
  } else if (lower.includes("sebutkan daftar") || lower.includes("hafalan")) {
    level = "Mengingat (C1)";
    code = "C1";
    explanation = "Fokus pada mengingat fakta, terminologi, atau istilah dasar.";
  }

  let sampleAnswer = `Halo! Terima kasih telah berkontribusi dalam sesi "${topic}". `;
  if (postType === "Ajukan Pertanyaan") {
    sampleAnswer += `Pertanyaan ini sangat relevan untuk memperdalam pemahaman konsep. Dari perspektif pedagogis, ${topic} menekankan proses kognitif aktif di mana pembelajar mengonstruksi pengetahuan secara bermakna. Harap diingat bahwa jawaban ini merupakan panduan pendahuluan dari AI Asisten dan akan ditinjau serta diperkuat langsung oleh Dosen/Tutor Anda.`;
  } else if (postType === "Refleksi Materi (sudah/belum paham)") {
    sampleAnswer += `Refleksi yang sangat konstruktif! Kesadaran metakognitif mengenai bagian yang sudah dan belum dipahami merupakan langkah penting dalam penguasaan materi ${topic}. Silakan eksplorasi lebih lanjut bersama rekan kelompok dan nantikan tanggapan penguatan dari Tutor.`;
  } else {
    sampleAnswer += `Tanggapan yang sangat baik untuk memperkaya dinamika ruang diskusi kelas. Poin yang Anda sampaikan memberikan sudut pandang menarik mengenai ${topic}. Tutor akan segera memberikan ulasan penguatan dan penilaian.`;
  }

  return {
    aiResponse: sampleAnswer,
    bloomLevel: level,
    bloomCode: code,
    bloomExplanation: explanation,
    suggestedReinforcement: `Bagus sekali, pemikiran kritis sudah mulai terbentuk. Penguatan tutor: Pastikan untuk menghubungkan konsep ${topic} dengan prinsip interaksi aktif di kelas modern.`,
  };
}

// API: Analyze student post and generate preliminary scaffolding
app.post("/api/analyze-post", async (req, res) => {
  try {
    const { sessionTitle, postType, content, studentName } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: "Konten postingan tidak boleh kosong" });
    }

    const ai = getAI();
    if (!ai) {
      // Return reliable fallback if API key is not yet configured
      const fallback = fallbackBloomAnalysis(
        sessionTitle || "Belajar Pembelajaran",
        content,
        postType || "Ajukan Pertanyaan"
      );
      return res.json(fallback);
    }

    const prompt = `Anda adalah asisten AI pedagogis resmi pada LMS Perguruan Tinggi untuk mata kuliah dan topik: "${sessionTitle || "Belajar Pembelajaran"}".
Seorang mahasiswa (${studentName || "Mahasiswa"}) mengirimkan postingan jenis "${postType || "Diskusi"}":
"${content}"

Tugas Anda:
1. Berikan "aiResponse" (Jawaban Sementara / Scaffolding): Penjelasan ilmiah yang ramah, ringkas, memantik pemikiran kritis mahasiswa (2-3 paragraf singkat), dengan nada akademis yang santun berbahasa Indonesia.
2. Identifikasi "bloomLevel": Klasifikasi tingkat berpikir kognitif Taksonomi Bloom (Pilih salah satu persis: "Mengingat (C1)", "Memahami (C2)", "Menerapkan (C3)", "Menganalisis (C4)", "Mengevaluasi (C5)", "Menciptakan (C6)").
3. Tentukan "bloomCode": Salah satu dari "C1", "C2", "C3", "C4", "C5", "C6".
4. Berikan "bloomExplanation": Penjelasan 1-2 kalimat mengapa postingan tersebut masuk ke tingkat kognitif Bloom tersebut.
5. Berikan "suggestedReinforcement": Saran penguatan atau koreksi materi yang dapat digunakan Dosen/Tutor saat memvalidasi jawaban.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            aiResponse: {
              type: Type.STRING,
              description: "Jawaban sementara ramah pedagogis untuk mahasiswa.",
            },
            bloomLevel: {
              type: Type.STRING,
              description: "Level Taksonomi Bloom, misalnya 'Memahami (C2)'.",
            },
            bloomCode: {
              type: Type.STRING,
              description: "Kode Bloom, misalnya 'C2'.",
            },
            bloomExplanation: {
              type: Type.STRING,
              description: "Alasan klasifikasi level kognitif.",
            },
            suggestedReinforcement: {
              type: Type.STRING,
              description: "Rekomendasi penguatan untuk Dosen/Tutor.",
            },
          },
          required: [
            "aiResponse",
            "bloomLevel",
            "bloomCode",
            "bloomExplanation",
            "suggestedReinforcement",
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (error: any) {
    console.error("Gemini API error:", error?.message || error);
    // Provide clean fallback so the student workflow is never interrupted
    const fallback = fallbackBloomAnalysis(
      req.body.sessionTitle || "Belajar Pembelajaran",
      req.body.content || "",
      req.body.postType || "Ajukan Pertanyaan"
    );
    return res.json(fallback);
  }
});

// API Health
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`LMS Server running on port ${PORT}`);
  });
}

startServer();
