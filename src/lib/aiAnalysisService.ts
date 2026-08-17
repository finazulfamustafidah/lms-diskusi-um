import { GoogleGenAI } from "@google/genai";

export interface AIAnalysisResult {
  aiResponse: string;
  bloomLevel: string;
  bloomCode: string;
  bloomExplanation: string;
  suggestedReinforcement: string;
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

/**
 * Direct REST API call to Google Generative Language
 */
async function callGeminiDirectREST(apiKey: string, prompt: string): Promise<AIAnalysisResult | null> {
  const models = [
    "gemini-3.5-flash-lite",
    "gemini-3.5-flash",
    "gemini-3.6-flash",
    "gemini-3.7-flash"
  ];

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const parsed = cleanJsonString(rawText);
          if (parsed && parsed.aiResponse) {
            return parsed;
          }
        }
      } else {
        const err = await res.json().catch(() => ({}));
        console.warn(`Direct Gemini call with ${model} error:`, err);
      }
    } catch (e) {
      console.warn(`Direct Gemini call failed on ${model}:`, e);
    }
  }
  return null;
}

/**
 * Comprehensive Smart Pedagogical Knowledge Base for offline or local fallback
 */
export function generateSmartLocalAnalysis(
  topic: string,
  content: string,
  postType: string,
  studentName: string
): AIAnalysisResult {
  const lower = content.toLowerCase();
  let bloomLevel = "Memahami (C2)";
  let bloomCode = "C2";
  let bloomExplanation =
    "Postingan mengeksplorasi penjelasan konsep dan pemahaman teori pembelajaran.";

  if (
    lower.includes("rancang") ||
    lower.includes("buatlah") ||
    lower.includes("strategi baru") ||
    lower.includes("sintesis") ||
    lower.includes("ide pengembangan")
  ) {
    bloomLevel = "Menciptakan (C6)";
    bloomCode = "C6";
    bloomExplanation =
      "Mahasiswa mengonseptualisasikan gagasan atau rancangan pembelajaran baru secara orisinal.";
  } else if (
    lower.includes("kritik") ||
    lower.includes("evaluasi") ||
    lower.includes("efektif") ||
    lower.includes("kelebihan") ||
    lower.includes("kekurangan") ||
    lower.includes("menurut saya")
  ) {
    bloomLevel = "Mengevaluasi (C5)";
    bloomCode = "C5";
    bloomExplanation =
      "Mahasiswa memberikan penilaian kritis, pertimbangan rasional, dan evaluasi konsep.";
  } else if (
    lower.includes("analisis") ||
    lower.includes("beda") ||
    lower.includes("perbedaan") ||
    lower.includes("membedakan") ||
    lower.includes("mengapa") ||
    lower.includes("faktor")
  ) {
    bloomLevel = "Menganalisis (C4)";
    bloomCode = "C4";
    bloomExplanation =
      "Mahasiswa menguraikan perbandingan antar elemen konsep dan menganalisis hubungan sebab-akibat.";
  } else if (
    lower.includes("contoh") ||
    lower.includes("terapkan") ||
    lower.includes("aplikasi") ||
    lower.includes("praktik") ||
    lower.includes("di kelas") ||
    lower.includes("cara guru")
  ) {
    bloomLevel = "Menerapkan (C3)";
    bloomCode = "C3";
    bloomExplanation =
      "Mahasiswa mengaitkan teori dengan aplikasi praktis dan skenario penerapan nyata di kelas.";
  } else if (
    lower.includes("apa itu") ||
    lower.includes("jelaskan") ||
    lower.includes("definisi") ||
    lower.includes("maksud") ||
    lower.includes("siapa")
  ) {
    bloomLevel = "Memahami (C2)";
    bloomCode = "C2";
    bloomExplanation =
      "Mahasiswa meminta klarifikasi, penjelasan mendalam, identifikasi tokoh, dan pemahaman konsep materi.";
  }

  // Knowledge base responses for typical learning theory questions
  let responseText = "";

  if (lower.includes("kognitivisme") || lower.includes("kognitif") && (lower.includes("pakar") || lower.includes("tokoh") || lower.includes("apa itu"))) {
    responseText = `Halo ${studentName}! Teori belajar Kognitivisme memandang belajar sebagai proses mental aktif dalam memproses, mengorganisasi, menyimpan, dan memanggil kembali informasi di dalam struktur kognitif (otak), bukan sekadar respons stimulus-respons mekanistik seperti behaviorisme.

Pakar utama pencetus dan pengembang aliran kognitivisme antara lain:
1. Jean Piaget: Menekankan tahap perkembangan kognitif dan pembentukan skema mental melalui asimilasi, akomodasi, dan ekuilibrasi.
2. Jerome Bruner: Menekankan pembelajaran berbasis penemuan (Discovery Learning) melalui tahapan enaktif, ikonik, dan simbolik, serta konsep Scaffolding.
3. David Ausubel: Menggagas Teori Belajar Bermakna (Meaningful Learning) dengan penggunaan Advance Organizers.
4. Robert Gagne: Mengembangkan model pemrosesan informasi dan 9 tahapan instruksional.

Contoh Penerapannya di Kelas:
Guru mengajarkan konsep ekosistem tidak hanya meminta siswa menghafal rantai makanan, melainkan mengarahkan siswa mengamati bagan alur energi, menghubungkannya dengan konsep jaring-jaring makanan yang telah mereka pelajari sebelumnya, dan merumuskan kesimpulan dampak jika salah satu populasi punah.`;
  } else if (lower.includes("asimilasi") || lower.includes("akomodasi")) {
    responseText = `Halo ${studentName}! Dalam teori perkembangan kognitif Jean Piaget, asimilasi dan akomodasi adalah mekanisme adaptasi kognitif:
- Asimilasi: Proses mengintegrasikan stimulus atau informasi baru ke dalam skema kognitif yang sudah ada tanpa mengubah struktur skema tersebut (misal anak melihat burung gereja dan langsung menyebutnya burung).
- Akomodasi: Proses penyesuaian atau pembentukan skema kognitif baru karena informasi baru tidak cocok dengan skema lama (misal anak melihat pinguin atau kelelawar, lalu menyadari tidak semua yang berbulu/terbang memiliki klasifikasi yang sama).

Contoh dalam IPA saat terjadi miskonsepsi:
Ketika siswa mengira bahwa tumbuhan makan dari tanah (miskonsepsi), guru memberikan bukti eksperimen fotosintesis. Konflik kognitif (disequilibrium) ini memaksa siswa melakukan akomodasi skema tentang nutrisi tumbuhan.`;
  } else if (lower.includes("short-term") || lower.includes("memori") || lower.includes("beban kognitif") || lower.includes("cognitive load")) {
    responseText = `Halo ${studentName}! Short-Term Memory (Working Memory) memiliki kapasitas terbatas (7 ± 2 unit informasi menurut Miller, atau 4 chunk informasi menurut riset modern). 

Untuk merancang media visual agar tidak membebani kapasitas kognitif (Cognitive Overload Theory oleh John Sweller):
1. Prinsip Split-Attention: Tempatkan teks penjelasan langsung di sebelah diagram/grafik terkait, bukan terpisah di bagian bawah.
2. Prinsip Redundansi: Hindari menyajikan teks narasi tertulis yang dibacakan kata demi kata bersamaan dengan animasi visual.
3. Prinsip Segmenting (Chunking): Bagi materi yang padat ke dalam slide atau modul-modul kecil bertahap.
4. Sinyal Visual (Signaling): Gunakan penyorotan (highlight) warna pada konsep kunci agar perhatian siswa fokus pada informasi inti.`;
  } else if (lower.includes("zpd") || lower.includes("scaffolding") || lower.includes("vygotsky")) {
    responseText = `Halo ${studentName}! Dalam teori sosiokultural Lev Vygotsky, Zone of Proximal Development (ZPD) adalah jarak antara tingkat perkembangan aktual anak (kemampuan menyelesaikan masalah secara mandiri) dengan tingkat perkembangan potensial (kemampuan di bawah bimbingan orang dewasa atau rekan yang lebih kompeten).

Scaffolding adalah bantuan terstruktur yang diberikan pada fase awal belajar di dalam ZPD, dengan prinsip penting 'fading'—yaitu pengurangan bantuan secara bertahap seiring meningkatnya kemandirian siswa.

Contoh di Kelas:
Guru memberikan template panduan langkah eksperimen IPA di awal pertemuan, kemudian pada pertemuan kedua siswa hanya diberikan garis besar, dan pada pertemuan ketiga siswa merancang eksperimen mandiri.`;
  } else {
    responseText = `Halo ${studentName}! Pertanyaan yang sangat menarik dan berbobot pada sesi "${topic}". 

Postingan Anda: "${content}" menyentuh aspek penting dalam teori belajar dan pembelajaran. Dari perspektif pedagogis, pemahaman konsep ini menuntut analisis keterkaitan antara struktur kognitif, strategi instruksional guru, dan lingkungan belajar yang mendukung.

Nantikan penguatan, klarifikasi teoretis, dan validasi lebih lanjut dari Dosen/Tutor Anda pada evaluasi kelas!`;
  }

  return {
    aiResponse: responseText,
    bloomLevel,
    bloomCode,
    bloomExplanation,
    suggestedReinforcement: `Bagus sekali, stimulus pemikiran kritis mahasiswa pada topik ${topic} sangat baik.`,
  };
}

/**
 * Main function to analyze student post with multi-tier execution
 */
export async function analyzeStudentPost(params: {
  sessionTitle: string;
  postType: string;
  content: string;
  studentName: string;
}): Promise<AIAnalysisResult> {
  const { sessionTitle, postType, content, studentName } = params;

  const prompt = `Anda adalah asisten AI pedagogis resmi pada LMS Perguruan Tinggi untuk topik: "${sessionTitle}".
Mahasiswa bernama "${studentName}" mengirimkan postingan jenis "${postType}":
"${content}"

INSTRUKSI KHUSUS:
1. Jawab pertanyaan / refleksi mahasiswa tersebut secara LENGKAP, ILMIAH, dan MENDALAM (2-3 paragraf). Jangan hanya memberikan kalimat terima kasih umum! Jika mahasiswa bertanya tentang teori, jelaskan konsep teoretis, sebutkan tokoh utama, prinsip operasional, dan contoh konkret di kelas.
2. Identifikasi "bloomLevel": Klasifikasi tingkat berpikir kognitif Taksonomi Bloom (Pilih salah satu persis: "Mengingat (C1)", "Memahami (C2)", "Menerapkan (C3)", "Menganalisis (C4)", "Mengevaluasi (C5)", "Menciptakan (C6)").
3. Tentukan "bloomCode": Salah satu dari "C1", "C2", "C3", "C4", "C5", "C6".
4. Berikan "bloomExplanation": Penjelasan 1-2 kalimat alasan klasifikasi level Taksonomi Bloom tersebut.
5. Berikan "suggestedReinforcement": Rekomendasi penguatan untuk Dosen/Tutor.

Format respons JSON persis:
{
  "aiResponse": "isi penjelasan pedagogis lengkap",
  "bloomLevel": "Memahami (C2)",
  "bloomCode": "C2",
  "bloomExplanation": "alasan level",
  "suggestedReinforcement": "saran penguatan"
}`;

  // 1. Try Vercel Serverless / Express Backend
  try {
    const res = await fetch("/api/analyze-post", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionTitle,
        postType,
        content,
        studentName,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.aiResponse && data.aiResponse.length > 30) {
        return data;
      }
    } else {
      console.warn("Backend /api/analyze-post status:", res.status);
    }
  } catch (err) {
    console.warn("Failed fetching /api/analyze-post:", err);
  }

  // 2. Try Client-side Direct REST or SDK with available API Keys
  const clientKey =
    (import.meta as any).env?.VITE_GEMINI_API_KEY ||
    (import.meta as any).env?.GEMINI_API_KEY;

  if (clientKey) {
    try {
      const directResult = await callGeminiDirectREST(clientKey, prompt);
      if (directResult && directResult.aiResponse && directResult.aiResponse.length > 20) {
        return directResult;
      }
    } catch (e) {
      console.warn("Direct REST Gemini failed:", e);
    }

    try {
      const ai = new GoogleGenAI({ apiKey: clientKey });
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const parsed = cleanJsonString(response.text || "{}");
      if (parsed && parsed.aiResponse) {
        return parsed;
      }
    } catch (err) {
      console.warn("Client SDK Gemini call failed:", err);
    }
  }

  // 3. Smart Pedagogical Knowledge Fallback
  return generateSmartLocalAnalysis(sessionTitle, content, postType, studentName);
}
