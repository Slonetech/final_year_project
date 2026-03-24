"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center h-96">
      <div className="text-center space-y-4">
        <p className="text-destructive font-medium">Failed to load inventory data</p>
        <p className="text-sm text-muted-foreground">Please try again later</p>
        <Button onClick={reset} variant="outline">Try again</Button>
      </div>
    </div>
  );
}
