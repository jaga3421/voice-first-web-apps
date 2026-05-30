import { handleDictation } from "../src/server/dictation-handler";

export const config = {
  api: {
    bodyParser: false,
  },
};

async function readBody(req: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  try {
    const bodyBuffer = await readBody(req);
    const host = req.headers.host || "localhost";
    const protocol = req.headers["x-forwarded-proto"] || "https";
    const url = `${protocol}://${host}${req.url || "/api/demo-dictation"}`;

    const request = new Request(url, {
      method: "POST",
      headers: req.headers,
      body: new Uint8Array(bodyBuffer),
    });

    const response = await handleDictation(request, process.env.OPENAI_API_KEY);

    res.statusCode = response.status;
    response.headers.forEach((value: string, key: string) => {
      res.setHeader(key, value);
    });
    res.end(await response.text());
  } catch (error: any) {
    console.error("Dictation handler error:", error);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        error: "Dictation handler failed",
        details: error?.message || "unknown",
      })
    );
  }
}
