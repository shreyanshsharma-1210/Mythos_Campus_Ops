// Azure Computer Vision — Image Analysis 4.0 (Florence)
// Endpoint: https://adityanew.cognitiveservices.azure.com
// Docs: https://learn.microsoft.com/azure/ai-services/computer-vision/overview-image-analysis

const CV_ENDPOINT = (import.meta.env.VITE_AZURE_CV_ENDPOINT as string)?.replace(/\/$/, "");
const CV_KEY      = import.meta.env.VITE_AZURE_CV_KEY as string;

const CV_URL = `${CV_ENDPOINT}/computervision/imageanalysis:analyze?api-version=2024-02-01&features=tags,objects`;

export interface CVResult {
  caption: string;
  tags: string[];
  objects: string[];
  denseCaptions: string[];
  raw: any;
}

/** Analyse an image file with Azure Computer Vision Image Analysis 4.0 */
export async function analyzeImageWithCV(file: File): Promise<CVResult> {
  const bytes = await file.arrayBuffer();

  const res = await fetch(CV_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/octet-stream",
      "Ocp-Apim-Subscription-Key": CV_KEY,
    },
    body: bytes,
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Azure CV Error Body:", err);
    throw new Error(`Azure CV ${res.status}: ${err}`);
  }

  const data = await res.json();

  const caption = data.captionResult?.text ?? data.description?.captions?.[0]?.text ?? "No caption";
  const tags = (data.tagsResult?.values ?? data.tags ?? []).map((t: any) => t.name ?? t) as string[];
  const objects = (data.objectsResult?.values ?? data.objects ?? []).map((o: any) => o.tags?.[0]?.name ?? o.object ?? "") as string[];
  const denseCaptions = (data.denseCaptionsResult?.values ?? []).map((c: any) => c.text as string);

  return { caption, tags, objects, denseCaptions, raw: data };
}

/** Format CV result into a descriptive context string for GPT */
export function cvResultToContext(cv: CVResult): string {
  const parts: string[] = [];
  if (cv.caption) parts.push(`Scene: ${cv.caption}`);
  if (cv.tags.length) parts.push(`Visual tags: ${cv.tags.slice(0, 10).join(", ")}`);
  if (cv.objects.length) parts.push(`Detected objects: ${cv.objects.slice(0, 8).join(", ")}`);
  if (cv.denseCaptions.length) parts.push(`Details: ${cv.denseCaptions.slice(0, 3).join(" | ")}`);
  return parts.join("\n");
}
