"use client";

import { Button } from "./ui/button";

export function RefreshButton() {
  return (
    <Button
      onClick={() => window.location.reload()}
      size="lg"
      className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl transition-colors"
    >
      Refresh Page
    </Button>
  );
}
