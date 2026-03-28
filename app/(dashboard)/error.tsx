"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center h-[70vh] p-6 text-center">
      <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-6">
        <AlertCircle className="w-10 h-10" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Something went wrong!</h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        {error.message.includes("Invalid supabaseUrl") 
          ? "Please check your .env.local file. SUPABASE_URL and SUPABASE_ANON_KEY must be valid."
          : "We encountered an unexpected error while loading the dashboard. Please try again."}
      </p>
      <div className="flex gap-4">
        <Button onClick={() => reset()} className="flex items-center gap-2">
          <RefreshCcw className="w-4 h-4" />
          Try Again
        </Button>
        <Button variant="outline" onClick={() => window.location.href = "/"}>
          Back to Home
        </Button>
      </div>
    </div>
  );
}
