import { openai } from "@ai-sdk/openai";
import { NoTranscriptGeneratedError, experimental_transcribe as transcribe } from "ai";

import { ApiRouteError } from "@/lib/api-response";
import { getAiTranscriptionConfig } from "@/lib/env";

type UpstreamErrorLike = {
  code?: string;
  cause?: {
    code?: string;
  };
  data?: {
    error?: {
      code?: string;
      message?: string;
    };
  };
  message?: string;
  responseBody?: string;
  statusCode?: number;
};

function normalizeModelName(modelName: string) {
  const normalized = modelName.trim();
  if (!normalized) return "whisper-1";
  if (!normalized.includes("/")) return normalized;

  const [, ...rest] = normalized.split("/");
  const candidate = rest.join("/").trim();
  return candidate || "whisper-1";
}

function shouldPreferWhisper(file: File) {
  const mimeType = file.type.toLowerCase();
  return mimeType.startsWith("audio/webm") || mimeType.startsWith("audio/ogg");
}

function getUpstreamStatusCode(error: unknown) {
  if (!error || typeof error !== "object") return undefined;
  return "statusCode" in error && typeof error.statusCode === "number"
    ? error.statusCode
    : undefined;
}

function getUpstreamCode(error: unknown) {
  if (!error || typeof error !== "object") return undefined;

  const candidate = error as UpstreamErrorLike;
  return (
    candidate.code ??
    candidate.cause?.code ??
    candidate.data?.error?.code
  )?.toLowerCase();
}

function getUpstreamMessage(error: unknown) {
  if (!error || typeof error !== "object") return undefined;

  const candidate = error as UpstreamErrorLike;
  return (
    candidate.data?.error?.message ??
    candidate.message ??
    candidate.responseBody
  )?.toLowerCase();
}

function shouldRetryWithWhisper(error: unknown) {
  if (NoTranscriptGeneratedError.isInstance(error)) {
    return true;
  }

  const statusCode = getUpstreamStatusCode(error);
  const code = getUpstreamCode(error) ?? "";
  const message = getUpstreamMessage(error) ?? "";

  return (
    statusCode === 400 &&
    (code === "unsupported_format" ||
      code === "invalid_value" ||
      message.includes("unsupported") ||
      message.includes("corrupted") ||
      message.includes("format"))
  );
}

async function transcribeWithModel(file: File, modelName: string) {
  const audioBytes = new Uint8Array(await file.arrayBuffer());
  const result = await transcribe({
    model: openai.transcription(modelName),
    audio: audioBytes,
    abortSignal: AbortSignal.timeout(30_000),
  });

  return result.text.trim();
}

export async function transcribeAudio(file: File): Promise<string> {
  const config = getAiTranscriptionConfig();
  const configuredModel = normalizeModelName(config.model);
  const fallbackModel = "whisper-1";
  const primaryModel = shouldPreferWhisper(file) ? fallbackModel : configuredModel;

  try {
    try {
      return await transcribeWithModel(file, primaryModel);
    } catch (error) {
      if (primaryModel !== fallbackModel && shouldRetryWithWhisper(error)) {
        console.warn("[transcription-fallback] primary model failed, retrying with whisper-1", {
          fileSize: file.size,
          mimeType: file.type,
          model: primaryModel,
        });

        return await transcribeWithModel(file, fallbackModel);
      }

      throw error;
    }
  } catch (error) {
    const statusCode = getUpstreamStatusCode(error);
    const upstreamCode = getUpstreamCode(error);
    const upstreamMessage = getUpstreamMessage(error);

    console.error("[transcription-upstream-error]", {
      fileSize: file.size,
      mimeType: file.type,
      model: primaryModel,
      statusCode,
      code: upstreamCode,
      message: upstreamMessage,
    });

    if (NoTranscriptGeneratedError.isInstance(error)) {
      throw new ApiRouteError(
        502,
        "UPSTREAM_ERROR",
        "Transcription returned no text. Please try again.",
      );
    }

    if (
      statusCode === 400 &&
      (upstreamCode === "invalid_value" || upstreamCode === "unsupported_format")
    ) {
      throw new ApiRouteError(
        400,
        "BAD_REQUEST",
        "Audio could not be decoded. Please try recording again.",
      );
    }

    throw new ApiRouteError(502, "UPSTREAM_ERROR", "Audio transcription failed.");
  }
}
