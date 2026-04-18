import { ApiRouteError } from "@/lib/api-response";
import { getAiTranscriptionConfig } from "@/lib/env";

type OpenAITranscriptionErrorPayload = {
  error?: {
    code?: string;
    message?: string;
    param?: string;
    type?: string;
  };
};

class TranscriptionUpstreamError extends Error {
  readonly statusCode: number;
  readonly code: string | undefined;

  constructor(statusCode: number, message: string, code?: string) {
    super(message);
    this.name = "TranscriptionUpstreamError";
    this.statusCode = statusCode;
    this.code = code;
  }
}

function normalizeModelName(modelName: string) {
  const normalized = modelName.trim();
  if (!normalized) return "gpt-4o-mini-transcribe";
  if (!normalized.includes("/")) return normalized;
  const [, ...rest] = normalized.split("/");
  const candidate = rest.join("/").trim();
  return candidate || "gpt-4o-mini-transcribe";
}

function normalizeMimeType(mimeType: string) {
  const normalized = mimeType.split(";")[0].trim().toLowerCase();
  if (!normalized) return "audio/webm";
  return normalized;
}

function extensionForMimeType(mimeType: string) {
  if (mimeType.includes("wav")) return "wav";
  if (mimeType.includes("mpeg") || mimeType.includes("mp3")) return "mp3";
  if (mimeType.includes("mp4") || mimeType.includes("m4a")) return "mp4";
  if (mimeType.includes("ogg")) return "ogg";
  return "webm";
}

function shouldRetryWithWhisper(error: unknown) {
  if (!(error instanceof TranscriptionUpstreamError)) return false;
  const message = error.message.toLowerCase();
  const code = error.code?.toLowerCase() ?? "";

  return (
    error.statusCode === 400 &&
    (code === "unsupported_format" ||
      code === "invalid_value" ||
      message.includes("unsupported") ||
      message.includes("corrupted"))
  );
}

async function requestTranscription(params: {
  apiKey: string;
  file: File;
  modelName: string;
  abortSignal: AbortSignal;
}) {
  const { apiKey, file, modelName, abortSignal } = params;
  const mimeType = normalizeMimeType(file.type);
  const extension = extensionForMimeType(mimeType);
  const hasName = typeof file.name === "string" && file.name.trim().length > 0;
  const normalizedFile = hasName
    ? file
    : new File([await file.arrayBuffer()], `recording.${extension}`, { type: mimeType });

  const formData = new FormData();
  if (hasName) {
    formData.append("file", normalizedFile);
  } else {
    formData.append("file", normalizedFile, normalizedFile.name);
  }
  formData.append("model", modelName);
  formData.append("response_format", "json");

  const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
    signal: abortSignal,
  });

  const payload = (await response
    .json()
    .catch(() => ({}))) as OpenAITranscriptionErrorPayload & { text?: string };

  if (!response.ok) {
    throw new TranscriptionUpstreamError(
      response.status,
      payload.error?.message ?? "Audio transcription request failed.",
      payload.error?.code,
    );
  }

  const transcript = payload.text?.trim();
  if (!transcript) {
    throw new ApiRouteError(502, "UPSTREAM_ERROR", "No transcript returned by the transcription model.");
  }

  return transcript;
}

export async function transcribeAudio(file: File): Promise<string> {
  const config = getAiTranscriptionConfig();
  const primaryModel = normalizeModelName(config.model);
  const fallbackModel = "whisper-1";

  try {
    try {
      return await requestTranscription({
        apiKey: config.apiKey,
        file,
        modelName: primaryModel,
        abortSignal: AbortSignal.timeout(30_000),
      });
    } catch (error) {
      if (primaryModel !== fallbackModel && shouldRetryWithWhisper(error)) {
        console.warn("[transcription-fallback] primary model rejected audio, retrying with whisper-1");
        return await requestTranscription({
          apiKey: config.apiKey,
          file,
          modelName: fallbackModel,
          abortSignal: AbortSignal.timeout(30_000),
        });
      }
      throw error;
    }
  } catch (error) {
    if (error instanceof ApiRouteError) {
      throw error;
    }

    if (error instanceof TranscriptionUpstreamError) {
      console.error("[transcription-upstream-error]", {
        statusCode: error.statusCode,
        code: error.code,
        message: error.message,
      });

      if (error.statusCode === 400 && error.code === "invalid_value") {
        throw new ApiRouteError(
          400,
          "BAD_REQUEST",
          "Audio could not be decoded. Please try recording again.",
        );
      }
    } else {
      console.error("[transcription-upstream-error]", error);
    }

    throw new ApiRouteError(502, "UPSTREAM_ERROR", "Audio transcription failed.");
  }
}
