import { GoogleGenAI, Type } from "@google/genai";

let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!aiClient && apiKey) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
    });
  }
  return aiClient;
}

export default async function handler(req: any, res: any) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { sessionTitle, postType, content, studentName } = req.body || {};

    if (!content || !content.trim()) {
      return res.status(400).json({ error: "Konten postingan tidak boleh kosong" });
    }

    const ai = getAI();
    if (!ai) {
      return res.status(500).json({
        error: "GEMINI_API_KEY tidak ditemukan di Environment Variables Vercel.",
        needsApiKey: true,
      });
    }

    const prompt = `Anda adalah asisten AI pedagogis resmi pada LMS Perguruan Tinggi untuk mata kuliah dan topik: "${sessionTitle || "Belajar Pembelajaran"}".
Seorang mahasiswa (${studentName || "Mahasiswa"}) mengirimkan postingan jenis "${postType || "Diskusi"}":
"${content}"

Tugas Anda:
1. Berikan "aiResponse" (Jawaban Sementara / Scaffolding): Berikan tanggapan ilmiah yang kontekstual, spesifik menjawab pertanyaan atau refleksi mahasiswa di atas, ramah, memantik pemikiran kritis mahasiswa (2-3 paragraf singkat), dengan nada akademis yang santun berbahasa Indonesia.
2. Identifikasi "bloomLevel": Klasifikasi tingkat berpikir kognitif Taksonomi Bloom (Pilih salah satu persis: "Mengingat (C1)", "Memahami (C2)", "Menerapkan (C3)", "Menganalisis (C4)", "Mengevaluasi (C5)", "Menciptakan (C6)").
3. Tentukan "bloomCode": Salah satu dari "C1", "C2", "C3", "C4", "C5", "C6".
4. Berikan "bloomExplanation": Penjelasan 1-2 kalimat mengapa postingan tersebut masuk ke tingkat kognitif Bloom tersebut.
5. Berikan "suggestedReinforcement": Saran penguatan atau rekomendasi evaluasi untuk Dosen/Tutor saat memvalidasi postingan ini.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            aiResponse: {
              type: Type.STRING,
              description: "Jawaban kontekstual pedagogis untuk pertanyaan/refleksi mahasiswa.",
            },
            bloomLevel: {
              type: Type.STRING,
              description: "Level Taksonomi Bloom, misal 'Memahami (C2)'.",
            },
            bloomCode: {
              type: Type.STRING,
              description: "Kode Bloom, misal 'C2'.",
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
    return res.status(200).json(parsed);
  } catch (error: any) {
    console.error("Vercel Gemini API error:", error);
    return res.status(500).json({ error: error?.message || "Internal AI Error" });
  }
}
