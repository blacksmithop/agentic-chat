import { BaseMessage } from "@langchain/core/messages";
import { Thread, ThreadStatus } from "@langchain/langgraph-sdk";
import { HumanInterrupt, HumanResponse } from "@langchain/langgraph/prebuilt";

export type HumanResponseWithEdits = HumanResponse &
  (
    | { acceptAllowed?: false; editsMade?: never }
    | { acceptAllowed?: true; editsMade?: boolean }
  );

export type Email = {
  id: string;
  thread_id: string;
  from_email: string;
  to_email: string;
  subject: string;
  page_content: string;
  send_time: string | undefined;
  read?: boolean;
  status?: "in-queue" | "processing" | "hitl" | "done";
};

export type ThreadValues = {
  email: Email;
  messages: BaseMessage[];
  triage: {
    logic: string;
    response: string;
  };
};

export type ThreadMetadata = {
  is_fork?: boolean;
  parent_thread_id?: string;
  is_pinned?: boolean;
  pinned_at?: string;
};

export type ThreadData<
  ThreadValues extends Record<string, any> = Record<string, any>,
> = {
  thread: Thread<ThreadValues> & {
    metadata?: ThreadMetadata;
  };
} & (
  | {
      status: "interrupted";
      interrupts: HumanInterrupt[] | undefined;
    }
  | {
      status: "idle" | "busy" | "error";
      interrupts?: never;
    }
);

export type ThreadStatusWithAll = ThreadStatus | "all";

export type SubmitType = "accept" | "response" | "edit";

export interface AgentInbox {
  id: string;
  graphId: string;
  deploymentUrl: string;
  name?: string;
  selected: boolean;
}