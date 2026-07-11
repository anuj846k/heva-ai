"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyIcon } from "lucide-react";
import { useState } from "react";
import { Streamdown } from "streamdown";
import { code } from "@streamdown/code";

export function FinalOutputPanel({ content }: { content: string | null }) {
  const [copied, setCopied] = useState(false);

  if (!content) return null;

  const copyText = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm">Final Output</CardTitle>
        <Button size="sm" variant="outline" onClick={copyText}>
          <CopyIcon className="mr-2 size-3" />
          {copied ? "Copied!" : "Copy"}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <Streamdown plugins={{ code }}>
            {content}
          </Streamdown>
        </div>
      </CardContent>
    </Card>
  );
}
