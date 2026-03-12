import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

export interface IntegrityReport {
  politicianName: string;
  summary: string;
  careerPath: string[];
  publicAssetsInfo: string;
  legalStatus: string;
  internationalFrameworkAnalysis: {
    variable: string;
    observation: string;
    riskLevel: 'Low' | 'Medium' | 'High';
  }[];
  overallAssessment: string;
  sources: { title: string; url: string }[];
}

export async function analyzePolitician(name: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
  
  const prompt = `
    Realiza una investigación inicial y neutral sobre el perfil público del político de Mendoza, Argentina: "${name}".
    
    Utiliza marcos internacionales de transparencia (como los de Transparency International, Banco Mundial o la OCDE) para analizar su trayectoria.
    
    Debes estructurar tu respuesta en formato MARKDOWN con las siguientes secciones:
    
    0. **Puntaje de Integridad**: Proporciona un porcentaje del 0% al 100% basado en la información pública hallada (donde 100% es integridad total y 0% es corrupción sistémica). Explica brevemente el criterio.
    1. **Resumen Ejecutivo**: Breve descripción del político.
    2. **Trayectoria Pública**: Cargos ocupados.
    3. **Patrimonio y Declaraciones**: Información pública sobre su evolución patrimonial.
    4. **Situación Judicial y Controversias**: Menciones en medios o registros públicos sobre causas judiciales o controversias (cita fuentes siempre).
    5. **Análisis bajo Variables Internacionales**: Evalúa aspectos como transparencia, coherencia ingresos-patrimonio, vínculos privados y rendición de cuentas.
    6. **Conclusión de Integridad Pública**: Un análisis de riesgo basado únicamente en los datos encontrados.
    
    IMPORTANTE: El puntaje debe ser una estimación analítica basada en la evidencia pública encontrada. Mantén un tono estrictamente neutral e informativo. Cita las URLs de las fuentes encontradas al final.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  return response.text || "No se pudo generar el reporte.";
}

export async function expandInvestigation(name: string, previousReport: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
  
  const prompt = `
    Basado en el siguiente informe inicial sobre el político "${name}":
    
    ---
    ${previousReport}
    ---
    
    Realiza una INVESTIGACIÓN EXHAUSTIVA Y PROFUNDA adicional. Busca datos específicos que no se hayan detallado suficientemente, enfocándote en:
    1. **Vínculos Empresariales y Conflictos de Interés**: Sociedades, participaciones en empresas o vínculos con contratistas del Estado.
    2. **Red de Contactos y Parentesco (Nepotismo)**: Familiares en cargos públicos o vínculos estrechos con otros actores políticos/económicos relevantes.
    3. **Financiamiento de Campañas**: Datos públicos sobre quiénes financiaron sus campañas electorales.
    4. **Historial de Votación o Decisiones Clave**: Si aplica, decisiones legislativas o ejecutivas que hayan generado controversia por beneficiar a sectores específicos.
    5. **Análisis de Discurso vs. Realidad**: Comparación entre sus promesas de transparencia y los datos hallados.
    
    Al final, REAJUSTA el **Puntaje de Integridad (0-100%)** basándote en estos nuevos hallazgos.
    
    Estructura la respuesta como un "ANEXO DE INVESTIGACIÓN EXHAUSTIVA" en formato MARKDOWN. 
    Mantén el tono neutral y cita fuentes con URLs.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  return response.text || "No se pudo ampliar la investigación.";
}

export async function askSpecificQuestion(name: string, question: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
  
  const prompt = `
    Actúa como un investigador de integridad pública. El usuario tiene una pregunta específica sobre el político de Mendoza "${name}":
    
    PREGUNTA: "${question}"
    
    Tu tarea es buscar la respuesta priorizando FUENTES OFICIALES (Boletín Oficial de Mendoza, sitios gubernamentales .gov.ar o .gob.ar, registros judiciales, sitios de transparencia oficial).
    
    Responde de manera concisa y objetiva en formato MARKDOWN. 
    Si no encuentras información en fuentes oficiales, menciónalo y utiliza fuentes periodísticas de alta credibilidad, aclarando siempre el origen.
    Incluye los enlaces (URLs) a las fuentes utilizadas.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  return response.text || "No se pudo obtener una respuesta a tu pregunta.";
}

export function extractSources(response: GenerateContentResponse) {
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (!chunks) return [];
  return chunks
    .map((chunk: any) => ({
      title: chunk.web?.title || "Fuente",
      url: chunk.web?.uri || "",
    }))
    .filter((source: any) => source.url !== "");
}
