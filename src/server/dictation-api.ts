import type { Connect, Plugin } from "vite";
import { handleDictation } from "./dictation-handler";

const readBody = (req: any): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });

const DICTATION_API_PATH = "/api/demo-dictation";

export function dictationApiPlugin(
  options: { openaiApiKey?: string } = {}
): Plugin {
  return {
    name: "dictation-api",
    configureServer(server) {
      const handler: Connect.NextHandleFunction = async (req, res, next) => {
        if (!req.url?.startsWith(DICTATION_API_PATH)) {
          return next();
        }
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: "Method not allowed" }));
          return;
        }

        try {
          const bodyBuffer = await readBody(req);
          const request = new Request(
            `http://localhost${DICTATION_API_PATH}`,
            {
              method: "POST",
              headers: req.headers as any,
              body: new Uint8Array(bodyBuffer),
            }
          );

          const apiKey = options.openaiApiKey || process.env.OPENAI_API_KEY;
          const response = await handleDictation(request, apiKey);

          res.statusCode = response.status;
          response.headers.forEach((value, key) => {
            res.setHeader(key, value);
          });
          res.end(await response.text());
        } catch (error: any) {
          console.error("Dictation middleware error:", error);
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              error: "Dictation middleware failed",
              details: error?.message || "unknown",
            })
          );
        }
      };

      server.middlewares.use(handler);
    },
  };
}
