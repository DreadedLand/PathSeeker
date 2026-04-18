import { NextResponse } from "next/server";

import { ApiRouteError, handleRouteError } from "@/lib/api-response";
import { enforceRateLimit } from "@/lib/rate-limit";
import {
  enforceMaxContentLength,
  enforceSameOrigin,
  requireAuthenticatedRequest,
} from "@/lib/request-security";
import { transcribeAudio } from "@/lib/providers/transcription";

const allowedMimeTypePrefixes = [
  "audio/webm",
  "audio/wav",
  "audio/x-wav",
  "audio/mpeg",
  "audio/mp3",
  "audio/mp4",
  "audio/ogg",
];
const maxAudioBytes = 10 * 1024 * 1024;
const minAudioBytes = 1024;

function isAllowedAudioType(mimeType: string) {
  return allowedMimeTypePrefixes.some((prefix) => mimeType === prefix || mimeType.startsWith(`${prefix};`));
}

export async function handleTranscribeRequest(formData: FormData) {
  const fileValue = formData.get("audio");

  if (!(fileValue instanceof File)) {
    throw new ApiRouteError(400, "BAD_REQUEST", "Audio file is required.");
  }

  if (!isAllowedAudioType(fileValue.type)) {
    throw new ApiRouteError(400, "BAD_REQUEST", "Unsupported audio format.");
  }

  if (fileValue.size < minAudioBytes || fileValue.size > maxAudioBytes) {
    throw new ApiRouteError(400, "BAD_REQUEST", "Audio file size must be between 1 KB and 10 MB.");
  }

  const transcript = await transcribeAudio(fileValue);
  return { transcript };
}

export async function POST(request: Request) {
  try {
    const userId = await requireAuthenticatedRequest();
    enforceSameOrigin(request);
    enforceRateLimit({
      key: `transcribe:${userId}`,
      maxRequests: 12,
      windowMs: 60_000,
    });
    enforceMaxContentLength(request, 11 * 1024 * 1024);

    const formData = await request.formData();
    const data = await handleTranscribeRequest(formData);

    return NextResponse.json(data);
  } catch (error) {
    return handleRouteError(error);
  }
}
