"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function HomePage() {
  const [goal, setGoal] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const submit = async () => {
    if (!goal.trim()) return;
    setLoading(true);
    const res = await fetch("/api/runs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goal: goal.trim() }),
    });
    const { id, error } = await res.json();
    if (error) {
      setLoading(false);
      return;
    }
    router.push(`/runs/${id}`);
    router.refresh();
  };

  return (
    <div className="flex h-full items-center justify-center p-4 md:p-6">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>What should the agent do?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Research top 3 AI note-taking apps and write a summary..."
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            rows={3}
            disabled={loading}
          />
          <Button
            onClick={submit}
            disabled={loading || !goal.trim()}
            className="w-full"
          >
            {loading ? "Starting..." : "Run Agent"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
