import { GoogleGenAI, Type } from "@google/genai";

export interface AIAnalysisResult {
  aiResponse: string;
  bloomLevel: string;
  bloomCode: string;
  bloomExplanation: string;
  suggestedReinforcement: string;
}

/**
 * Intelligent client-side fallback if server API is unreachable or fails
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
    lower.includes("maksud")
  ) {
    bloomLevel = "Memahami (C2)";
    bloomCode = "C2";
    bloomExplanation =
      "Mahasiswa meminta klarifikasi, penjelasan mendalam, dan pemahaman konsep materi.";
  }

  // Context-specific response building
  let responseText = "";
  if (lower.includes("asimilasi") || lower.includes("akomodasi")) {
    responseText = `Halo ${studentName}! Pertanyaan yang sangat bagus terkait konsep kognitif Jean Piaget. Asimilasi terjadi ketika siswa memasukkan informasi baru ke dalam skema kognitif yang sudah ada tanpa mengubah struktur skema tersebut. Sebaliknya, akomodasi terjadi ketika skema lama harus diubah atau disesuaikan karena adanya informasi baru yang bertentangan (mispersepsi/miskonsepsi). Dalam konteks IPA, saat siswa mengalami miskonsepsi, guru perlu menciptakan situasi disequilibrium (konflik kognitif) agar proses akomodasi dapat berlangsung optimal.`;
  } else if (lower.includes("short-term") || lower.includes("memori") || lower.includes("kognitif")) {
    responseText = `Halo ${studentName}! Refleksi yang sangat mendalam mengenai pemrosesan informasi dan beban kognitif (Cognitive Load Theory). Untuk mencegah beban kognitif berlebih (cognitive overload) pada media visual, terapkan prinsip 'dual coding' dan 'split-attention reduction': tempatkan teks penjelasan berdekatan langsung dengan gambar grafik, hindari dekorasi visual berlebih, dan gunakan langkah bertahap (chunking).`;
  } else if (lower.includes("zpd") || lower.includes("scaffolding") || lower.includes("vygotsky")) {
    responseText = `Halo ${studentName}! Ini adalah poin sentral dalam teori sosiokultural Vygotsky. Kunci membedakan scaffolding yang sehat dengan ketergantungan adalah prinsip 'fading' (pelepasan bantuan bertahap). Guru memberikan bantuan hanya pada batas kesulitan tertinggi siswa (Zone of Proximal Development), lalu secara perlahan mengurangi intervensi saat kemandirian siswa meningkat.`;
  } else {
    responseText = `Halo ${studentName}! Terima kasih atas kontribusi Anda pada sesi "${topic}". Terkait postingan Anda: "${content.substring(0, 100)}...", aspek ini sangat menarik untuk didiskusikan lebih lanjut karena menekankan keterlibatan kognitif aktif pembelajar. Silakan lanjutkan diskusi bersama rekan dan nantikan penguatan lebih lanjut dari Dosen/Tutor.`;
  }

  return {
    aiResponse: responseText,
    bloomLevel,
    bloomCode,
    bloomExplanation,
    suggestedReinforcement: `Bagus sekali, pemikiran kritis sudah terstimulasi dengan baik pada topik ${topic}.`,
  };
}

/**
 * Main function to analyze student post with multi-tier fallback
 */
export async function analyzeStudentPost(params: {
  sessionTitle: string;
  postType: string;
  content: string;
  studentName: string;
}): Promise<AIAnalysisResult> {
  const { sessionTitle, postType, content, studentName } = params;

  // 1. Try backend/serverless endpoint first (/api/analyze-post)
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
      if (data && data.aiResponse && data.bloomLevel) {
        return data;
      }
    }
  } catch (err) {
    console.warn("API /api/analyze-post fetch failed, checking client fallback:", err);
  }

  // 2. Try client-side Gemini if VITE_GEMINI_API_KEY is available
  const clientKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
  if (clientKey) {
    try {
      const ai = new GoogleGenAI({ apiKey: clientKey });
      const prompt = `Anda adalah asisten AI pedagogis resmi pada LMS Perguruan Tinggi untuk mata kuliah dan topik: "${sessionTitle}".
Seorang mahasiswa (${studentName}) mengirimkan postingan jenis "${postType}":
"${content}"

Tugas Anda:
1. Berikan "aiResponse": Tanggapan ilmiah yang kontekstual, spesifik menjawab pertanyaan atau refleksi mahasiswa di atas, ramah pedagogis (2-3 paragraf singkat), santun berbahasa Indonesia.
2. Identifikasi "bloomLevel": Tingkat kognitif Bloom ("Mengingat (C1)", "Memahami (C2)", "Menerapkan (C3)", "Menganalisis (C4)", "Mengevaluasi (C5)", "Menciptakan (C6)").
3. Tentukan "bloomCode": Salah satu dari "C1", "C2", "C3", "C4", "C5", "C6".
4. Berikan "bloomExplanation": Penjelasan 1-2 kalimat alasan klasifikasi level.
5. Berikan "suggestedReinforcement": Rekomendasi penguatan untuk Dosen/Tutor.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              aiResponse: { type: Type.STRING },
              bloomLevel: { type: Type.STRING },
              bloomCode: { type: Type.STRING },
              bloomExplanation: { type: Type.STRING },
              suggestedReinforcement: { type: Type.STRING },
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
      if (parsed && parsed.aiResponse) {
        return parsed;
      }
    } catch (err) {
      console.warn("Client-side Gemini API call failed:", err);
    }
  }

  // 3. Smart local analysis fallback
  return generateSmartLocalAnalysis(sessionTitle, content, postType, studentName);
}
