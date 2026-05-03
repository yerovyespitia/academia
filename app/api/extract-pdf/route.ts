import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const context = (formData.get("context") as string) ?? "study";
    const sectionTitle =
      (formData.get("sectionTitle") as string) ?? "información del PIAR";

    if (!file) {
      return new Response("No se proporcionó archivo", { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const prompt =
      context === "piar"
        ? `Extrae y resume el contenido relevante de este documento para la sección "${sectionTitle}" de un PIAR (Plan Individual de Apoyos y Ajustes Razonables) según el Decreto 1421 de 2017 de Colombia. Presenta la información de forma clara y organizada en español colombiano. Incluye todos los datos relevantes: diagnósticos, observaciones, recomendaciones, fechas importantes, profesionales involucrados. No inventes información que no esté en el documento. Si el documento no tiene información relevante para esta sección, indícalo brevemente.`
        : `Extrae las ideas más importantes de este documento con datos puntuales. Identifica y organiza: conceptos clave, definiciones precisas, fechas relevantes, fórmulas, datos estadísticos, pasos o procesos, y conclusiones importantes. Prioriza la información más valiosa para estudiar, no transcribas el documento completo. Presenta todo de forma clara y estructurada en español colombiano. No inventes información que no esté en el documento.`;

    const result = await generateText({
      model: openai("gpt-4o"),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "file",
              data: base64,
              mediaType: "application/pdf",
            },
            {
              type: "text",
              text: prompt,
            },
          ],
        },
      ],
    });

    return new Response(result.text, { status: 200 });
  } catch (error) {
    console.error("Error extracting PDF:", error);
    return new Response("Error al procesar el archivo PDF", { status: 500 });
  }
}
