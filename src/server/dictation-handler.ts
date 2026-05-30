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

export async function handleDictation(
  request: Request,
  apiKey: string | undefined
): Promise<Response> {
  if (!apiKey) {
    return new Response(
      JSON.stringify({
        error: "OPENAI_API_KEY not set",
        details:
          "Set OPENAI_API_KEY as an environment variable in this environment.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const openai = new OpenAI({ apiKey });

  try {
    const formData = await request.formData();

    const file = formData.get("file") as unknown as File | null;
    const context = formData.get("context");
    const existingTranscript = formData.get("transcript");
    const aiMode = formData.get("aiMode");
    const commands = formData.get("commands");

    if (!file) {
      return new Response(JSON.stringify({ error: "No file provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const recentContext = typeof context === "string" ? context.trim() : "";
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

    return new Response(
      JSON.stringify({
        text: formattedFragment,
        rawText,
        matchedCommandId: intentMatch?.matchedCommandId ?? null,
        matchReason: intentMatch?.reason ?? "",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Transcription error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to transcribe audio",
        details: error?.message || "Unknown transcription error",
      }),
      {
        status: error?.status || 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
