"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { useSearchParams } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { RouteLocationBias, RoutePlanResponse } from "@/lib/types";
import { api } from "@/convex/_generated/api";

type ApiFailure = {
  error?: {
    message?: string;
  };
};

type ReverseGeocodeResponse = {
  address?: string;
};

const homeAddressStorageKey = "pathseeker.home-address";
const preferredRecordingMimeTypes = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4",
  "audio/ogg;codecs=opus",
  "audio/ogg",
];
const minimumRecordedAudioBytes = 1024;

function getFileExtensionFromMimeType(mimeType: string) {
  const normalized = mimeType.split(";")[0].trim().toLowerCase();
  if (normalized.includes("wav")) return "wav";
  if (normalized.includes("mpeg") || normalized.includes("mp3")) return "mp3";
  if (normalized.includes("mp4") || normalized.includes("m4a")) return "mp4";
  if (normalized.includes("ogg")) return "ogg";
  return "webm";
}

function getBrowserStorage() {
  if (typeof window === "undefined") return null;
  const storage = window.localStorage;
  if (
    !storage ||
    typeof storage.getItem !== "function" ||
    typeof storage.setItem !== "function" ||
    typeof storage.removeItem !== "function"
  ) return null;
  return storage;
}

function formatArrivalTime(isoValue?: string) {
  if (!isoValue) return undefined;
  const date = new Date(isoValue);
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function extractApiError(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== "object") return fallback;
  const candidate = payload as ApiFailure;
  return candidate.error?.message ?? fallback;
}

export function TripPlanner() {
  const searchParams = useSearchParams();
  const [homeAddress, setHomeAddress] = useState("");
  const [prompt, setPrompt] = useState(searchParams.get("prompt") ?? "");
  const [result, setResult] = useState<RoutePlanResponse | null>(null);
  const [currentLocation, setCurrentLocation] = useState<RouteLocationBias | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isPlanning, setIsPlanning] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const { isAuthenticated: isConvexAuthenticated, isLoading: isConvexAuthLoading } = useConvexAuth();
  const addHistory = useMutation(api.pathseeker.addHistory);
  const savedPlaces = useQuery(api.pathseeker.listSavedPlaces);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const arrivalTime = useMemo(
    () => formatArrivalTime(result?.route.arrivalEstimate),
    [result],
  );

  useEffect(() => {
    const storage = getBrowserStorage();
    if (!storage) return;
    const stored = storage.getItem(homeAddressStorageKey);
    if (stored) setHomeAddress(stored);
  }, []);

  useEffect(() => {
    const storage = getBrowserStorage();
    if (!storage) return;
    if (homeAddress.trim().length === 0) {
      storage.removeItem(homeAddressStorageKey);
      return;
    }
    storage.setItem(homeAddressStorageKey, homeAddress.trim());
  }, [homeAddress]);

  function requestCurrentLocation() {
    if (!navigator.geolocation) return Promise.resolve<RouteLocationBias | null>(null);
    setIsLocating(true);
    return new Promise<RouteLocationBias | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const nextLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setCurrentLocation(nextLocation);
          try {
            const response = await fetch("/api/reverse-geocode", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(nextLocation),
            });
            const payload = (await response.json()) as ReverseGeocodeResponse | ApiFailure;
            if (!response.ok) throw new Error(extractApiError(payload, "Could not resolve your current location."));
            if ("address" in payload && typeof payload.address === "string" && payload.address.length > 0) {
              setHomeAddress(payload.address);
            }
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Could not resolve your current location.");
          } finally {
            setIsLocating(false);
            resolve(nextLocation);
          }
        },
        () => { setIsLocating(false); resolve(null); },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 300000 },
      );
    });
  }

  async function uploadAudio(blob: Blob) {
    if (blob.size < minimumRecordedAudioBytes) {
      toast.error("Recording was too short. Please try again.");
      return;
    }

    const mimeType = blob.type || "audio/webm";
    const extension = getFileExtensionFromMimeType(mimeType);
    const file = new File([blob], `recording.${extension}`, { type: mimeType });
    const formData = new FormData();
    formData.append("audio", file);
    setIsTranscribing(true);
    try {
      const response = await fetch("/api/transcribe", { method: "POST", body: formData });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(extractApiError(payload, "Could not transcribe audio."));
      }

      if (!payload || typeof payload !== "object" || !("transcript" in payload)) {
        setPrompt("");
        return;
      }

      const transcript = (payload as { transcript?: string }).transcript;
      setPrompt(typeof transcript === "string" ? transcript : "");
      toast.success("Transcription ready.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not transcribe audio.");
    } finally {
      setIsTranscribing(false);
    }
  }

  async function startRecording() {
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error("This browser does not support microphone capture.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const preferredMimeType = preferredRecordingMimeTypes.find((mimeType) =>
        MediaRecorder.isTypeSupported(mimeType),
      );
      const recorder = preferredMimeType
        ? new MediaRecorder(stream, { mimeType: preferredMimeType })
        : new MediaRecorder(stream);
      recorderRef.current = recorder;
      recorder.addEventListener("dataavailable", (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      });
      recorder.addEventListener("stop", () => {
        const mimeType = recorder.mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: mimeType });
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }

        if (blob.size < minimumRecordedAudioBytes) {
          toast.error("Recording was too short. Please try again.");
          return;
        }

        void uploadAudio(blob);
      });

      recorder.start(500);
      setIsRecording(true);
    } catch {
      toast.error("Microphone permission denied or unavailable.");
    }
  }

  function stopRecording() {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
    recorderRef.current = null;
    setIsRecording(false);
  }

  useEffect(() => {
    return () => {
      if (recorderRef.current && recorderRef.current.state !== "inactive") {
        try {
          recorderRef.current.stop();
        } catch {
          // no-op
        }
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPlanning(true);
    setResult(null);
    try {
      let locationBias = currentLocation;
      if (!locationBias) locationBias = await requestCurrentLocation();
      const response = await fetch("/api/plan-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          ...(homeAddress.trim().length > 0 ? { homeAddress: homeAddress.trim() } : {}),
          ...(locationBias ? { locationBias } : {}),
          ...(savedPlaces && savedPlaces.length > 0 ? { savedPlaces } : {}),
        }),
      });
      const payload = (await response.json()) as RoutePlanResponse | ApiFailure;
      if (!response.ok) throw new Error(extractApiError(payload, "Could not plan route."));
      const routeResult = payload as RoutePlanResponse;
      setResult(routeResult);
      toast.success("Route planned.");
      if (isConvexAuthenticated) {
        await addHistory({
          prompt: prompt.trim(),
          homeAddress: homeAddress.trim().length > 0 ? homeAddress.trim() : undefined,
          parsedStops: routeResult.parsed.stops,
          deadline: routeResult.parsed.deadline,
          orderedStops: routeResult.route.orderedStops,
          totalDurationText: routeResult.route.totalDurationText,
          arrivalEstimate: routeResult.route.arrivalEstimate,
          originLabel: routeResult.route.originLabel,
        });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not plan route.");
    } finally {
      setIsPlanning(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      {/* <div className="relative overflow-hidden rounded-xl border border-border/60 bg-primary px-6 py-8 text-primary-foreground">
        <div className="relative z-10 flex flex-col gap-1">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">PathSeeker</h1>
          <p className="max-w-2xl text-sm opacity-80">
            Describe your errands in plain language. PathSeeker extracts stops, optimizes your route, and returns a traffic-aware ETA.
          </p>
        </div>
        <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-10 right-20 h-28 w-28 rounded-full bg-white/5" />
      </div> */}

      <div className="grid gap-4 md:grid-cols-[1fr_280px]">
        <Card className="border-border/70 bg-card/40">
          <CardHeader className="pb-3">
            <CardTitle>Trip Request</CardTitle>
            <CardDescription>Voice or text input with AI-powered stop extraction.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-2">
                <Label htmlFor="home-address">Home Address</Label>
                <Input
                  id="home-address"
                  value={homeAddress}
                  onChange={(event) => setHomeAddress(event.target.value)}
                  placeholder="123 Main St, Evanston, IL 60201"
                  className="bg-background/70"
                />
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-muted-foreground">Saved locally and used when your trip mentions home.</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => { void requestCurrentLocation(); }}
                    disabled={isLocating || isPlanning || isTranscribing}
                  >
                    {isLocating ? "Getting Location..." : currentLocation ? "Location Ready" : "Use Current Location"}
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="trip-prompt">Request</Label>
                <Textarea
                  id="trip-prompt"
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  placeholder="I need to go to Target, UPS, and home before 6 PM."
                  rows={4}
                  className="bg-background/70"
                />
                <p className="text-xs text-muted-foreground">
                  Type vague stops, and PathSeeker resolves them using your location and saved places.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant={isRecording ? "destructive" : "outline"}
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isTranscribing || isPlanning || isLocating}
                >
                  {isRecording ? "Stop Recording" : "Record Voice"}
                </Button>
                <Button
                  type="submit"
                  disabled={
                    isPlanning ||
                    isTranscribing ||
                    isLocating ||
                    isConvexAuthLoading ||
                    prompt.trim().length === 0
                  }
                  className="flex-1 sm:flex-none"
                >
                  {isPlanning ? (
                    "Planning Route..."
                  ) : (
                    <>
                      Plan Route
                      <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="size-4" />
                    </>
                  )}
                </Button>
              </div>

              {(isRecording || isTranscribing || isPlanning || isLocating) && (
                <div className="flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-2 text-sm text-muted-foreground">
                  <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-primary" />
                  {isPlanning
                    ? "Planning route..."
                    : isLocating
                      ? "Getting location..."
                      : isRecording
                        ? "Recording audio..."
                        : "Transcribing audio..."}
                </div>
              )}

            </form>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card className="border-border/70 bg-card/40 flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">How it works</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm flex-1">
              {[
                { step: "1", label: "Describe your errands", detail: "Plain language, any order" },
                { step: "2", label: "AI extracts your stops", detail: "Resolves saved places too" },
                { step: "3", label: "Route gets optimized", detail: "Traffic-aware, fastest order" },
                { step: "4", label: "Get your ETA", detail: "Know when you'll be home" },
              ].map(({ step, label, detail }) => (
                <div key={step} className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">{step}</span>
                  <div>
                    <p className="font-medium leading-tight">{label}</p>
                    <p className="text-xs text-muted-foreground">{detail}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {savedPlaces && savedPlaces.length > 0 && (
            <Card className="border-border/70 bg-card/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Saved Places</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-1.5 text-sm">
                {savedPlaces.map((place) => (
                  <div
                    key={place._id}
                    className="flex cursor-pointer items-center justify-between gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-muted/60"
                    onClick={() => setPrompt((p) => p ? `${p}, ${place.name}` : place.name)}
                  >
                    <span className="font-medium">{place.name}</span>
                    <span className="truncate text-xs text-muted-foreground">{place.address}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {currentLocation && (
            <Card className="border-border/70 bg-card/40">
              <CardContent className="py-3 text-sm">
                <p className="font-medium text-primary">Location active</p>
                <p className="text-xs text-muted-foreground">
                  {currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {result && (
        <Card className="border-border/70 bg-card/40">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Route Result</CardTitle>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{result.meta.provider}</Badge>
                <Badge variant="outline">{result.meta.model}</Badge>
                {result.route.originLabel && <Badge variant="outline">From: {result.route.originLabel}</Badge>}
              </div>
            </div>
            <CardDescription>Resolved stops, optimized order, and trip timing.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-border/60 bg-muted/40 px-4 py-3">
                <p className="text-xs text-muted-foreground">Total Duration</p>
                <p className="text-2xl font-semibold">{result.route.totalDurationText}</p>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/40 px-4 py-3">
                <p className="text-xs text-muted-foreground">Estimated Arrival</p>
                <p className="text-2xl font-semibold">{arrivalTime ?? "N/A"}</p>
              </div>
              {result.parsed.deadline && (
                <div className="rounded-lg border border-border/60 bg-primary/10 px-4 py-3">
                  <p className="text-xs text-muted-foreground">Your Deadline</p>
                  <p className="text-2xl font-semibold">{result.parsed.deadline}</p>
                </div>
              )}
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="flex flex-col gap-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Parsed Stops</p>
                <div className="flex flex-wrap gap-2">
                  {result.parsed.stops.map((stop) => (
                    <Badge key={stop} variant="outline">{stop}</Badge>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Optimized Order</p>
                <ol className="flex flex-col gap-2">
                  {result.route.orderedStops.map((stop, index) => (
                    <li key={`${stop}-${index}`} className="flex items-center gap-3 rounded-lg border border-border/70 bg-card px-3 py-2 text-sm">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">{index + 1}</span>
                      {stop}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
