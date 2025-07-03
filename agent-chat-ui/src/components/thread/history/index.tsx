import { Button } from "@/components/ui/button";
import { useThreads } from "@/providers/Thread";
import { Thread } from "@langchain/langgraph-sdk";
import { useEffect } from "react";
import { TooltipIconButton } from "@/components/thread/tooltip-icon-button";

import type { ThreadMetadata } from "../agent-inbox/types";
import { getContentString } from "../utils";
import { useQueryState, parseAsBoolean } from "nuqs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { PanelRightOpen, PanelRightClose } from "lucide-react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { LoaderCircle, GitFork, GitMerge , Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function ThreadList({
  threads,
  onThreadClick,
}: {
  threads: Thread[];
  onThreadClick?: (threadId: string) => void;
}) {
  const [threadId, setThreadId] = useQueryState("threadId");
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copyingId, setCopyingId] = useState<string | null>(null);
  const { setThreads } = useThreads(); // Get setThreads from useThreads hook

  const handleDelete = async (threadId: string) => {
    if (!window.confirm("Are you sure you want to delete this thread?")) return;

    try {
      setDeletingId(threadId);
      const response = await fetch(`${apiUrl}/threads/${threadId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete thread");

      // Optimistic update - remove from local state
      setThreads((prevThreads) =>
        prevThreads.filter((t) => t.thread_id !== threadId),
      );
      toast.success("Thread deleted");
    } catch (error) {
      toast.error("Failed to delete thread");
    } finally {
      setDeletingId(null);
    }
  };

const handleCopyThread = async (threadId: string) => {
  try {
    setCopyingId(threadId);
    
    // 1. First copy the thread (POST without body)
    const copyResponse = await fetch(`${apiUrl}/threads/${threadId}/copy`, {
      method: "POST"
    });
    
    if (!copyResponse.ok) throw new Error('Failed to copy thread');
    
    const newThread = await copyResponse.json();
    
    // 2. Then update the metadata (PATCH with metadata)
    const patchResponse = await fetch(`${apiUrl}/threads/${newThread.thread_id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        metadata: {
          is_fork: true,
          parent_thread_id: threadId,
          created_at: new Date().toISOString(),
        }
      })
    });

    if (!patchResponse.ok) throw new Error('Failed to update thread metadata');
    
    const updatedThread = await patchResponse.json();
    setThreads([updatedThread, ...threads]);
    toast.success("Thread duplicated");
    return updatedThread;
    
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Failed to copy thread');
    throw error;
  } finally {
    setCopyingId(null);
  }
};
  return (
    <div className="flex h-full w-full flex-col items-start justify-start gap-2 overflow-y-scroll [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-track]:bg-transparent">
      {threads.map((t) => {
        let itemText = t.thread_id;
        if (
          typeof t.values === "object" &&
          t.values &&
          "messages" in t.values &&
          Array.isArray(t.values.messages) &&
          t.values.messages?.length > 0
        ) {
          const firstMessage = t.values.messages[0];
          itemText = getContentString(firstMessage.content);
        }

        const parentThreadId = (t as { metadata?: ThreadMetadata })?.metadata?.parent_thread_id;
        const isFork = (t as { metadata?: ThreadMetadata })?.metadata?.is_fork;
        const parentThread = threads.find(th => th.thread_id === parentThreadId);
        return (
          <div
            key={t.thread_id}
            className="flex w-full items-center justify-between gap-1 px-1"
          >
            <Button
              variant="ghost"
              className="w-[calc(100%-72px)] items-start justify-start truncate text-left font-normal"
              onClick={(e) => {
                e.preventDefault();
                onThreadClick?.(t.thread_id);
                if (t.thread_id === threadId) return;
                setThreadId(t.thread_id);
              }}
            >
              <p className="truncate">{itemText}</p>
            </Button>
            <div className="flex gap-1">
              {isFork && parentThread && (
                <TooltipIconButton
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (typeof parentThreadId === 'string') {
                      setThreadId(parentThreadId);
                    }
                  }}
                  tooltip={`Go to parent thread: ${typeof parentThreadId === 'string' ? parentThreadId.slice(0, 8) : ''}...`}
                >
                  <GitMerge className="h-4 w-4 text-purple-500 hover:text-purple-700" />
                </TooltipIconButton>
              )}
              <TooltipIconButton
                variant="ghost"
                size="sm"
                onClick={() => handleCopyThread(t.thread_id)}
                disabled={copyingId === t.thread_id}
                tooltip="Duplicate thread"
              >
                {copyingId === t.thread_id ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <GitFork className="h-4 w-4 text-blue-500 hover:text-blue-700" />
                )}
              </TooltipIconButton>
              <TooltipIconButton
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(t.thread_id)}
                disabled={deletingId === t.thread_id}
                tooltip="Delete thread"
              >
                {deletingId === t.thread_id ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 text-red-500 hover:text-red-700" />
                )}
              </TooltipIconButton>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ThreadHistoryLoading() {
  return (
    <div className="flex h-full w-full flex-col items-start justify-start gap-2 overflow-y-scroll [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-track]:bg-transparent">
      {Array.from({ length: 30 }).map((_, i) => (
        <Skeleton
          key={`skeleton-${i}`}
          className="h-10 w-[280px]"
        />
      ))}
    </div>
  );
}

export default function ThreadHistory() {
  const isLargeScreen = useMediaQuery("(min-width: 1024px)");
  const [chatHistoryOpen, setChatHistoryOpen] = useQueryState(
    "chatHistoryOpen",
    parseAsBoolean.withDefault(false),
  );

  const { getThreads, threads, setThreads, threadsLoading, setThreadsLoading } =
    useThreads();

  useEffect(() => {
    if (typeof window === "undefined") return;
    setThreadsLoading(true);
    getThreads()
      .then(setThreads)
      .catch(console.error)
      .finally(() => setThreadsLoading(false));
  }, []);

  return (
    <>
      <div className="shadow-inner-right hidden h-screen w-[300px] shrink-0 flex-col items-start justify-start gap-6 border-r-[1px] border-slate-300 lg:flex">
        <div className="flex w-full items-center justify-between px-4 pt-1.5">
          <Button
            className="hover:bg-gray-100"
            variant="ghost"
            onClick={() => setChatHistoryOpen((p) => !p)}
          >
            {chatHistoryOpen ? (
              <PanelRightOpen className="size-5" />
            ) : (
              <PanelRightClose className="size-5" />
            )}
          </Button>
          <h1 className="text-xl font-semibold tracking-tight">
            Thread History
          </h1>
        </div>
        {threadsLoading ? (
          <ThreadHistoryLoading />
        ) : (
          <ThreadList threads={threads} />
        )}
      </div>
      <div className="lg:hidden">
        <Sheet
          open={!!chatHistoryOpen && !isLargeScreen}
          onOpenChange={(open) => {
            if (isLargeScreen) return;
            setChatHistoryOpen(open);
          }}
        >
          <SheetContent
            side="left"
            className="flex lg:hidden"
          >
            <SheetHeader>
              <SheetTitle>Thread History</SheetTitle>
            </SheetHeader>
            <ThreadList
              threads={threads}
              onThreadClick={() => setChatHistoryOpen((o) => !o)}
            />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
