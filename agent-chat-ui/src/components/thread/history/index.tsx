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
import { PanelRightOpen, PanelRightClose, Pin, LoaderCircle, GitFork, GitMerge, Trash2 } from "lucide-react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
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
  const [pinningId, setPinningId] = useState<string | null>(null);
  const { setThreads } = useThreads();

  const sortedThreads = [...threads].sort((a, b) => {
    const aPinned = a.metadata?.is_pinned ? 1 : 0;
    const bPinned = b.metadata?.is_pinned ? 1 : 0;
    if (aPinned !== bPinned) return bPinned - aPinned;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const handleDelete = async (threadId: string) => {
    if (!window.confirm("Are you sure you want to delete this thread?")) return;

    try {
      setDeletingId(threadId);
      const response = await fetch(`${apiUrl}/threads/${threadId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete thread");

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

  const handleTogglePin = async (threadId: string) => {
    try {
      setPinningId(threadId);
      const thread = threads.find((t) => t.thread_id === threadId);
      if (!thread) return;

      const isCurrentlyPinned = thread.metadata?.is_pinned;
      const newPinStatus = !isCurrentlyPinned;

      const response = await fetch(`${apiUrl}/threads/${threadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metadata: {
            ...thread.metadata,
            is_pinned: newPinStatus,
            pinned_at: newPinStatus ? new Date().toISOString() : undefined,
          },
        }),
      });

      if (!response.ok) throw new Error("Failed to update pin status");

      const updatedThread = await response.json();
      setThreads(
        threads.map((t) => (t.thread_id === threadId ? updatedThread : t)),
      );

      toast.success(`Thread ${newPinStatus ? "pinned" : "unpinned"}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update pin status",
      );
    } finally {
      setPinningId(null);
    }
  };

  const handleCopyThread = async (threadId: string) => {
    try {
      setCopyingId(threadId);
      const copyResponse = await fetch(`${apiUrl}/threads/${threadId}/copy`, {
        method: "POST",
      });

      if (!copyResponse.ok) throw new Error("Failed to copy thread");

      const newThread = await copyResponse.json();

      const patchResponse = await fetch(
        `${apiUrl}/threads/${newThread.thread_id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            metadata: {
              is_fork: true,
              parent_thread_id: threadId,
              forked_at: new Date().toISOString(),
            },
          }),
        },
      );

      if (!patchResponse.ok)
        throw new Error("Failed to update thread metadata");
      const updatedThread = await patchResponse.json();

      setThreads([updatedThread, ...threads]);
      setThreadId(updatedThread.thread_id);
      toast.success("Thread duplicated");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to copy thread",
      );
    } finally {
      setCopyingId(null);
    }
  };

  return (
    <div className="flex h-full w-full flex-col items-start justify-start gap-2 overflow-y-scroll [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-track]:bg-transparent">
      {/* Pinned threads section */}
      {sortedThreads.some(t => t.metadata?.is_pinned) && (
        <div className="px-2 py-1 text-xs font-medium text-gray-500 w-full sticky top-0 bg-white dark:bg-gray-950 z-10">
          PINNED
        </div>
      )}
      
      {sortedThreads.filter(t => t.metadata?.is_pinned).map((t) => {
        const itemText = getThreadText(t);
        const metadata = t.metadata || {};
        return (
          <ThreadItem 
            key={t.thread_id}
            t={t}
            itemText={itemText}
            metadata={metadata}
            onThreadClick={onThreadClick}
            threadId={threadId}
            setThreadId={setThreadId}
            handleTogglePin={handleTogglePin}
            handleCopyThread={handleCopyThread}
            handleDelete={handleDelete}
            copyingId={copyingId}
            deletingId={deletingId}
            pinningId={pinningId}
          />
        );
      })}

      {/* Unpinned threads section */}
      {sortedThreads.some(t => !t.metadata?.is_pinned) && (
        <div className="px-2 py-1 text-xs font-medium text-gray-500 w-full sticky top-0 bg-white dark:bg-gray-950 z-10">
          ALL THREADS
        </div>
      )}
      
      {sortedThreads.filter(t => !t.metadata?.is_pinned).map((t) => {
        const itemText = getThreadText(t);
        const metadata = t.metadata || {};
        return (
          <ThreadItem 
            key={t.thread_id}
            t={t}
            itemText={itemText}
            metadata={metadata}
            onThreadClick={onThreadClick}
            threadId={threadId}
            setThreadId={setThreadId}
            handleTogglePin={handleTogglePin}
            handleCopyThread={handleCopyThread}
            handleDelete={handleDelete}
            copyingId={copyingId}
            deletingId={deletingId}
            pinningId={pinningId}
          />
        );
      })}
    </div>
  );
}

function ThreadItem({
  t,
  itemText,
  metadata,
  onThreadClick,
  threadId,
  setThreadId,
  handleTogglePin,
  handleCopyThread,
  handleDelete,
  copyingId,
  deletingId,
  pinningId
}: {
  t: Thread;
  itemText: string;
  metadata: ThreadMetadata;
  onThreadClick?: (threadId: string) => void;
  threadId: string | null;
  setThreadId: (id: string | null) => void;
  handleTogglePin: (id: string) => void;
  handleCopyThread: (id: string) => void;
  handleDelete: (id: string) => void;
  copyingId: string | null;
  deletingId: string | null;
  pinningId: string | null;
}) {
  const parentThreadId = metadata.parent_thread_id;
  const isFork = metadata.is_fork;
  
  return (
    <div className="flex w-full items-center justify-between gap-1 px-1">
      <Button
        variant="ghost"
        className="w-[calc(100%-96px)] items-start justify-start truncate text-left font-normal"
        onClick={(e) => {
          e.preventDefault();
          onThreadClick?.(t.thread_id);
          if (t.thread_id === threadId) return;
          setThreadId(t.thread_id);
        }}
      >
        <p className="truncate">
          {itemText}
          {isFork && (
            <span className="ml-1 text-xs text-gray-500">(fork)</span>
          )}
        </p>
      </Button>
      <div className="flex gap-1">
        <TooltipIconButton
          variant="ghost"
          size="sm"
          onClick={() => handleTogglePin(t.thread_id)}
          disabled={pinningId === t.thread_id}
          tooltip={metadata.is_pinned ? "Unpin thread" : "Pin thread"}
        >
          {pinningId === t.thread_id ? (
            <LoaderCircle className="h-4 w-4 animate-spin" />
          ) : metadata.is_pinned ? (
            <Pin className="h-4 w-4 text-yellow-500 fill-yellow-500 hover:text-yellow-700" />
          ) : (
            <Pin className="h-4 w-4 text-gray-500 hover:text-gray-700" />
          )}
        </TooltipIconButton>
        
        {isFork && parentThreadId && (
          <TooltipIconButton
            variant="ghost"
            size="sm"
            onClick={() => setThreadId(parentThreadId)}
            tooltip={`Go to parent thread: ${parentThreadId.slice(0, 8)}...`}
          >
            <GitMerge className="h-4 w-4 text-purple-500 hover:text-purple-700" />
          </TooltipIconButton>
        )}
        
        <TooltipIconButton
          variant="ghost"
          size="sm"
          onClick={() => handleCopyThread(t.thread_id)}
          disabled={copyingId === t.thread_id}
          tooltip={isFork ? "Create another fork" : "Duplicate thread"}
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
}

function getThreadText(t: Thread): string {
  if (
    typeof t.values === "object" &&
    t.values &&
    "messages" in t.values &&
    Array.isArray(t.values.messages) &&
    t.values.messages?.length > 0
  ) {
    return getContentString(t.values.messages[0].content);
  }
  return t.thread_id;
}

// ... rest of the file remains unchanged (ThreadHistoryLoading and ThreadHistory components)
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
