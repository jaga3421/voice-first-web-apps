import type { Connect, Plugin } from "vite";
import { OpenAI } from "openai";

async function formatTranscriptFragment(
  openai: OpenAI,
  existingTranscript: string,
  newFragment: string
) {
  const transcriptSoFar = existingTranscript.trim();
  const fragment = newFragment.trim();

  if (!fragment) return "";
  if (!transcriptSoFar) return fragment;

  const transcriptTail = transcriptSoFar.slice(-300);

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.1,
    messages: [
      {
        role: "system",
        content:
          "You format only the newest dictation fragment. Improve punctuation, capitalization, and sentence boundaries while preserving wording and meaning. Use the prior transcript tail only as context. Do not rewrite, repeat, or summarize prior text. Return only the corrected new fragment.",
      },
      {
        role: "user",
        content: [
          `Prior transcript tail:\n${transcriptTail}`,
          `New fragment:\n${fragment}`,
          "Return only the corrected new fragment.",
        ].join("\n\n"),
      },
    ],
  });

  return completion.choices[0]?.message?.content?.trim() || fragment;
}

async function inferCommandIntent(
  openai: OpenAI,
  transcript: string,
  commandCatalog: any[]
) {
  if (!transcript || commandCatalog.length === 0) return null;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You classify a spoken transcript into one command from the provided catalog, or no match. Return strict JSON with keys matchedCommandId and reason. If nothing fits, matchedCommandId must be null.",
      },
      {
        role: "user",
        content: JSON.stringify({
          transcript,
          commands: commandCatalog,
        }),
      },
    ],
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) return null;

  try {
    const parsed = JSON.parse(content);
    return {
      matchedCommandId: parsed.matchedCommandId ?? null,
      reason: parsed.reason ?? "",
    };
  } catch {
    return null;
  }
}

const readBody = (req: any): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });

export function dictationApiPlugin(options: {
  openaiApiKey?: string;
} = {}): Plugin {
  return {
    name: "dictation-api",
    configureServer(server) {
      const handler: Connect.NextHandleFunction = async (req, res, next) => {
        if (!req.url?.startsWith("/demo-dictation/api")) {
          return next();
        }
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: "Method not allowed" }));
          return;
        }

        const apiKey = options.openaiApiKey || process.env.OPENAI_API_KEY;
        if (!apiKey) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              error: "OPENAI_API_KEY not set",
              details:
                "Set OPENAI_API_KEY in your environment before starting `npm run dev`.",
            })
          );
          return;
        }

        const openai = new OpenAI({ apiKey });

        try {
          const bodyBuffer = await readBody(req);
          const request = new Request("http://localhost/demo-dictation/api", {
            method: "POST",
            headers: req.headers as any,
            body: new Uint8Array(bodyBuffer),
          });
          const formData = await request.formData();

          const file = formData.get("file") as unknown as File | null;
          const context = formData.get("context");
          const existingTranscript = formData.get("transcript");
          const aiMode = formData.get("aiMode");
          const commands = formData.get("commands");

          if (!file) {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "No file provided" }));
            return;
          }

          const recentContext =
            typeof context === "string" ? context.trim() : "";
          const prompt = recentContext || undefined;

          const transcription = await openai.audio.transcriptions.create({
            file,
            model: "gpt-4o-mini-transcribe",
            ...(prompt ? { prompt } : {}),
          });

          const rawText = transcription.text?.trim() ?? "";
          const transcriptSoFar =
            typeof existingTranscript === "string"
              ? existingTranscript.trim()
              : "";
          const formattedFragment = rawText
            ? await formatTranscriptFragment(openai, transcriptSoFar, rawText)
            : "";
          const commandCatalog =
            typeof commands === "string" && commands.trim()
              ? JSON.parse(commands)
              : [];
          const shouldInferIntent = aiMode === "true";
          const intentMatch = shouldInferIntent
            ? await inferCommandIntent(openai, rawText, commandCatalog)
            : null;

          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              text: formattedFragment,
              rawText,
              matchedCommandId: intentMatch?.matchedCommandId ?? null,
              matchReason: intentMatch?.reason ?? "",
            })
          );
        } catch (error: any) {
          console.error("Transcription error:", error);
          res.statusCode = error?.status || 500;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              error: "Failed to transcribe audio",
              details: error?.message || "Unknown transcription error",
            })
          );
        }
      };

      server.middlewares.use(handler);
    },
  };
}
