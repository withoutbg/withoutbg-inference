"use client";

import { Plus } from "lucide-react";
import type { Job } from "@/hooks/useProcessingQueue";
import PasteShortcutKbd from "@/components/ui/PasteShortcutKbd";
import ImageCard from "./ImageCard";

interface QueueGridProps {
  jobs: Job[];
  onCompare: (id: string) => void;
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
  onAddMore: () => void;
  atLimit: boolean;
}

export default function QueueGrid({
  jobs,
  onCompare,
  onRemove,
  onRetry,
  onAddMore,
  atLimit,
}: QueueGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {jobs.map((job) => (
        <ImageCard
          key={job.id}
          job={job}
          onCompare={() => onCompare(job.id)}
          onRemove={() => onRemove(job.id)}
          onRetry={() => onRetry(job.id)}
        />
      ))}

      {/* Add-more tile — makes it obvious more images can be added alongside */}
      {!atLimit && (
        <button
          type="button"
          onClick={onAddMore}
          aria-label="Add more images"
          className="group flex aspect-square flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 bg-wbg-page dark:bg-wbg-surface text-gray-500 dark:text-gray-400 transition-colors hover:border-purple-400 hover:text-purple-500 dark:hover:border-purple-500 dark:hover:text-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-current/30 bg-white/60 dark:bg-gray-800/60 transition-transform group-hover:scale-110">
            <Plus className="h-5 w-5" aria-hidden />
          </span>
          <span className="text-xs font-medium">Add more</span>
          <span className="px-2 text-center text-[10px] leading-snug text-gray-400 dark:text-gray-500">
            Click, drag &amp; drop, or paste <PasteShortcutKbd />
          </span>
        </button>
      )}
    </div>
  );
}
