import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Phone, PhoneOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createRetellWebCall } from "@/lib/retell.functions";
import { toast } from "sonner";

type CallState = "idle" | "connecting" | "live" | "ending";

export function VoiceCallButton() {
  const startCall = useServerFn(createRetellWebCall);
  const [state, setState] = useState<CallState>("idle");
  const clientRef = useRef<import("retell-client-js-sdk").RetellWebClient | null>(null);

  useEffect(() => {
    return () => {
      clientRef.current?.stopCall();
    };
  }, []);

  async function handleStart() {
    try {
      setState("connecting");
      const { accessToken } = await startCall({});
      const { RetellWebClient } = await import("retell-client-js-sdk");
      const client = new RetellWebClient();
      clientRef.current = client;
      client.on("call_started", () => setState("live"));
      client.on("call_ended", () => {
        setState("idle");
        clientRef.current = null;
      });
      client.on("error", (err: unknown) => {
        console.error("Retell error", err);
        toast.error("Voice call ended unexpectedly.");
        setState("idle");
      });
      await client.startCall({ accessToken });
    } catch (err) {
      console.error(err);
      toast.error(
        err instanceof Error ? err.message : "Could not start the voice agent.",
      );
      setState("idle");
    }
  }

  async function handleStop() {
    setState("ending");
    try {
      await clientRef.current?.stopCall();
    } finally {
      setState("idle");
      clientRef.current = null;
    }
  }

  if (state === "live" || state === "ending") {
    return (
      <Button
        size="lg"
        variant="destructive"
        onClick={handleStop}
        disabled={state === "ending"}
      >
        {state === "ending" ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <PhoneOff className="mr-2 h-4 w-4" />
        )}
        End call
      </Button>
    );
  }

  return (
    <Button
      size="lg"
      onClick={handleStart}
      disabled={state === "connecting"}
      className="shadow-glow"
    >
      {state === "connecting" ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Phone className="mr-2 h-4 w-4" />
      )}
      Get Your Proposal Now
    </Button>
  );
}