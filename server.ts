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

function cleanJsonString(rawText: string): any {
  if (!rawText) return null;
  let cleaned = rawText.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.slice(0, -3);
  }
  return JSON.parse(cleaned.trim());
}

// Cognitive Bloom level helper for fallback
function fallbackBloomAnalysis(topic: string, text: string, postType: string, studentName?: string) {
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
    lower.includes("bagaimana cara mengajar") ||
    lower.includes("contoh")
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

  let sampleAnswer = "";
  if (lower.includes("kognitivisme") || lower.includes("kognitif") && (lower.includes("pakar") || lower.includes("tokoh") || lower.includes("apa itu"))) {
    sampleAnswer = `Halo ${studentName || "Mahasiswa"}! Teori belajar Kognitivisme menekankan bahwa proses belajar merupakan pengorganisasian kognitif mental aktif (bagaimana informasi diterima, diolah, dan disimpan dalam memori jangka panjang), bukan sekadar respons mekanistik perilaku.

Tokoh-tokoh pakar utama pencetus dan pengembang aliran kognitivisme:
1. Jean Piaget: Teori perkembangan skema kognitif anak melalui asimilasi, akomodasi, dan ekuilibrasi pada tahap sensori-motorik hingga formal operasional.
2. Jerome Bruner: Model pembelajaran penemuan (Discovery Learning) serta tahapan representasi pengetahuan (enaktif, ikonik, simbolik) dan scaffolding.
3. David Ausubel: Teori belajar bermakna (Meaningful Learning) dengan pengait konsep awal (advance organizers).
4. Robert Gagne: Teori kondisi belajar dan model tahapan pemrosesan informasi (Information Processing Model).

Contoh Penerapan di Kelas:
Guru tidak hanya meminta siswa mendengarkan ceramah rumus, melainkan mengajak siswa mengamati pola data eksperimen sederhana, mengidentifikasi keteraturan prinsip fisis, dan merumuskan konsep secara mandiri.`;
  } else if (lower.includes("asimilasi") || lower.includes("akomodasi")) {
    sampleAnswer = `Halo ${studentName || "Mahasiswa"}! Dalam teori Piaget, asimilasi adalah penggabungan informasi baru ke skema kognitif yang sudah ada tanpa mengubah skema tersebut. Sedangkan akomodasi adalah restrukturisasi atau penyesuaian skema lama menjadi skema baru karena adanya anomali atau miskonsepsi. Saat siswa mengalami miskonsepsi dalam IPA, guru harus menciptakan 'disequilibrium' (konflik kognitif) melalui demonstrasi atau pertanyaan pemandu agar siswa melakukan akomodasi skema mental mereka.`;
  } else {
    sampleAnswer = `Halo ${studentName || "Mahasiswa"}! Pertanyaan yang sangat berbobot pada sesi "${topic}". Terkait pertanyaan Anda: "${text.substring(0, 120)}...", aspek ini merupakan pilar esensial dalam penguasaan teori pembelajaran. Nantikan penguatan dan tinjauan lebih mendalam dari Dosen/Tutor pada evaluasi kelas!`;
  }

  return {
    aiResponse: sampleAnswer,
    bloomLevel: level,
    bloomCode: code,
    bloomExplanation: explanation,
    suggestedReinforcement: `Bagus sekali, stimulus pemikiran kritis mahasiswa pada topik ${topic} sangat baik.`,
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
        postType || "Ajukan Pertanyaan",
        studentName
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
      model: "gemini-3.5-flash-lite",
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

    const parsed = cleanJsonString(response.text || "{}");
    if (parsed && parsed.aiResponse) {
      return res.json(parsed);
    }
    const fallback = fallbackBloomAnalysis(
      sessionTitle || "Belajar Pembelajaran",
      content,
      postType || "Ajukan Pertanyaan",
      studentName
    );
    return res.json(fallback);
  } catch (error: any) {
    console.error("Gemini API error:", error?.message || error);
    // Provide clean fallback so the student workflow is never interrupted
    const fallback = fallbackBloomAnalysis(
      req.body.sessionTitle || "Belajar Pembelajaran",
      req.body.content || "",
      req.body.postType || "Ajukan Pertanyaan",
      req.body.studentName
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
