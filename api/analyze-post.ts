import { GoogleGenAI, Type } from "@google/genai";

async function callGeminiREST(apiKey: string, prompt: string) {
  const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
  let lastError: any = null;

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
          },
        }),
      });

      if (response.ok) {
        const json = await response.json();
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return JSON.parse(text);
        }
      } else {
        const errJson = await response.json().catch(() => ({}));
        console.warn(`Model ${model} returned ${response.status}:`, errJson);
        lastError = errJson;
      }
    } catch (e: any) {
      console.warn(`Error calling ${model}:`, e?.message);
      lastError = e;
    }
  }

  throw new Error(
    lastError?.error?.message || lastError?.message || "Failed to generate AI response"
  );
}

export default async function handler(req: any, res: any) {
  // CORS configuration
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

    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.VITE_GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      console.error("GEMINI_API_KEY not found in Vercel environment variables.");
      return res.status(500).json({
        error: "GEMINI_API_KEY belum dikonfigurasi di Environment Variables Vercel.",
        needsApiKey: true,
      });
    }

    const prompt = `Anda adalah asisten AI pedagogis resmi pada LMS Perguruan Tinggi untuk topik: "${sessionTitle || "Belajar Pembelajaran"}".
Mahasiswa bernama "${studentName || "Mahasiswa"}" mengirimkan postingan jenis "${postType || "Diskusi"}":
"${content}"

INSTRUKSI KHUSUS:
1. Jawab pertanyaan / refleksi mahasiswa tersebut secara LENGKAP, ILMIAH, dan MENDALAM (2-3 paragraf). Jangan hanya memberikan kalimat terima kasih umum! Jika mahasiswa bertanya tentang teori, sebutkan definisi, tokoh pencetus (seperti Jean Piaget, Jerome Bruner, David Ausubel, dll.), prinsip utama, dan contoh nyata di kelas.
2. Identifikasi "bloomLevel": Pilih salah satu persis: "Mengingat (C1)", "Memahami (C2)", "Menerapkan (C3)", "Menganalisis (C4)", "Mengevaluasi (C5)", "Menciptakan (C6)".
3. Tentukan "bloomCode": Salah satu dari "C1", "C2", "C3", "C4", "C5", "C6".
4. Berikan "bloomExplanation": Penjelasan 1-2 kalimat alasan klasifikasi level Taksonomi Bloom tersebut.
5. Berikan "suggestedReinforcement": Saran penguatan atau rekomendasi evaluasi singkat untuk Dosen/Tutor.

Kembalikan format JSON persis:
{
  "aiResponse": "isi jawaban ilmiah pedagogis lengkap di sini",
  "bloomLevel": "Memahami (C2)",
  "bloomCode": "C2",
  "bloomExplanation": "alasan level bloom",
  "suggestedReinforcement": "penguatan untuk dosen"
}`;

    // Try REST API first for maximum stability in serverless environment
    try {
      const result = await callGeminiREST(apiKey, prompt);
      if (result && result.aiResponse) {
        return res.status(200).json(result);
      }
    } catch (restErr: any) {
      console.warn("REST call failed, trying @google/genai SDK:", restErr?.message);
    }

    // Fallback to @google/genai SDK
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.status(200).json(parsed);
  } catch (error: any) {
    console.error("Vercel Gemini API error:", error?.message || error);
    return res.status(500).json({ error: error?.message || "Internal AI Error" });
  }
}
