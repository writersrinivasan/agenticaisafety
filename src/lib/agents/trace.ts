import { Annotation } from "@langchain/langgraph";

export type TraceEvent = {
  node: string;
  status: "ok" | "info" | "warn" | "block";
  label: string;
  detail?: string;
};

/** Append-only trace channel shared by all lab graphs so the UI can show the path taken. */
export const TraceChannel = Annotation<TraceEvent[]>({
  reducer: (a, b) => a.concat(b),
  default: () => [],
});

export const ev = (node: string, status: TraceEvent["status"], label: string, detail?: string): TraceEvent => ({
  node,
  status,
  label,
  detail,
});
