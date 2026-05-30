import Busboy from "busboy";
import { OpenAI, toFile } from "openai";

type ParsedRequest = {
  file: { buffer: Buffer; filename: string; mimeType: string } | null;
  fields: Record<string, string>;
};

function parseMultipart(req: any): Promise<ParsedRequest> {
  return new Promise((resolve, reject) => {
    const contentType = req.headers["content-type"];
    if (!contentType || !contentType.includes("multipart/form-data")) {
      reject(new Error("Expected multipart/form-data"));
      return;
    }

    const busboy = Busboy({ headers: req.headers });
    const fields: Record<string, string> = {};
    let fileResult: ParsedRequest["file"] = null;

    busboy.on("field", (name: string, value: string) => {
      fields[name] = value;
    });

    busboy.on(
      "file",
      (
        _name: string,
        stream: NodeJS.ReadableStream,
        info: { filename: string; mimeType: string }
      ) => {
        const chunks: Buffer[] = [];
        stream.on("data", (chunk: Buffer) => chunks.push(chunk));
        stream.on("end", () => {
          fileResult = {
            buffer: Buffer.concat(chunks),
            filename: info.filename || "audio.webm",
            mimeType: info.mimeType || "audio/webm",
          };
        });
        stream.on("error", reject);
      }
    );

    busboy.on("error", reject);
    busboy.on("close", () => resolve({ file: fileResult, fields }));

    req.pipe(busboy);
  });
}

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
        content: JSON.stringify({ transcript, commands: commandCatalog }),
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

export const config = {
  runtime: "nodejs",
  maxDuration: 30,
};

export default async function handler(req: any, res: any) {
  res.setHeader("Content-Type", "application/json");

  if (req.method !== "POST") {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    res.statusCode = 500;
    res.end(
      JSON.stringify({
        error: "OPENAI_API_KEY not set",
        details: "Set OPENAI_API_KEY in the Vercel project's Environment Variables.",
      })
    );
    return;
  }

  let parsed: ParsedRequest;
  try {
    parsed = await parseMultipart(req);
  } catch (error: any) {
    console.error("Multipart parse failed:", error);
    res.statusCode = 400;
    res.end(
      JSON.stringify({
        error: "Failed to parse upload",
        details: error?.message || "unknown",
      })
    );
    return;
  }

  const { file, fields } = parsed;
  if (!file) {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: "No file provided" }));
    return;
  }

  try {
    const openai = new OpenAI({ apiKey });

    const recentContext =
      typeof fields.context === "string" ? fields.context.trim() : "";
    const prompt = recentContext || undefined;

    const audioFile = await toFile(file.buffer, file.filename, {
      type: file.mimeType,
    });

    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "gpt-4o-mini-transcribe",
      ...(prompt ? { prompt } : {}),
    });

    const rawText = transcription.text?.trim() ?? "";
    const transcriptSoFar =
      typeof fields.transcript === "string" ? fields.transcript.trim() : "";
    const formattedFragment = rawText
      ? await formatTranscriptFragment(openai, transcriptSoFar, rawText)
      : "";

    const commandCatalog =
      typeof fields.commands === "string" && fields.commands.trim()
        ? JSON.parse(fields.commands)
        : [];
    const shouldInferIntent = fields.aiMode === "true";
    const intentMatch = shouldInferIntent
      ? await inferCommandIntent(openai, rawText, commandCatalog)
      : null;

    res.statusCode = 200;
    res.end(
      JSON.stringify({
        text: formattedFragment,
        rawText,
        matchedCommandId: intentMatch?.matchedCommandId ?? null,
        matchReason: intentMatch?.reason ?? "",
      })
    );
  } catch (error: any) {
    console.error("Dictation handler error:", error);
    res.statusCode = error?.status || 500;
    res.end(
      JSON.stringify({
        error: "Failed to transcribe audio",
        details: error?.message || "Unknown transcription error",
      })
    );
  }
}
