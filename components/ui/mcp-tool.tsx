"use client";

import * as React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { IconChevronRight } from "@tabler/icons-react";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const SHIMMER_STYLE_ID = "an-mcp-tool-shimmer-styles";
const SHIMMER_STYLES = `
@keyframes an-mcp-shimmer {
  from { background-position: 100% center; }
  to { background-position: 0% center; }
}
.an-mcp-shimmer {
  display: inline-flex;
  align-items: center;
  height: 1rem;
  background-size: 250% 100%;
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  background-image: linear-gradient(90deg, #a3a3a3 0%, #a3a3a3 40%, #525252 50%, #a3a3a3 60%, #a3a3a3 100%);
  background-repeat: no-repeat;
  animation: an-mcp-shimmer 1.2s linear infinite;
}
`;

let shimmerStylesInjected = false;
function ensureShimmerStyles() {
  if (typeof document === "undefined") return;
  if (shimmerStylesInjected) return;
  if (document.getElementById(SHIMMER_STYLE_ID)) {
    shimmerStylesInjected = true;
    return;
  }
  const el = document.createElement("style");
  el.id = SHIMMER_STYLE_ID;
  el.textContent = SHIMMER_STYLES;
  document.head.appendChild(el);
  shimmerStylesInjected = true;
}

const COMPLETED_VERBS: Record<string, string> = {
  List: "Listed",
  Get: "Got",
  Create: "Created",
  Update: "Updated",
  Delete: "Deleted",
  Search: "Searched",
  Fetch: "Fetched",
  Retrieve: "Retrieved",
  Send: "Sent",
  Generate: "Generated",
  Add: "Added",
  Remove: "Removed",
  Modify: "Modified",
  Draft: "Drafted",
  Manage: "Managed",
  Query: "Queried",
  Start: "Started",
  Set: "Set",
  Check: "Checked",
  Find: "Found",
};

const PRIORITY_ARGS = [
  "query",
  "question",
  "email",
  "name",
  "id",
  "customer",
  "url",
  "issue",
  "body",
  "summary",
  "title",
];

function getCompletedTitle(displayName: string): string {
  const words = displayName.split(" ");
  const verb = words[0] ?? "";
  const rest = words.slice(1).join(" ");
  const completed = COMPLETED_VERBS[verb];
  return completed ? (rest ? `${completed} ${rest}` : completed) : displayName;
}

function formatMcpArgs(input?: Record<string, unknown>): string {
  if (!input || typeof input !== "object") return "";
  const entries = Object.entries(input).filter(
    ([, v]) => v !== undefined && v !== null && v !== "",
  );
  if (entries.length === 0) return "";

  const sorted = [...entries].sort(([a], [b]) => {
    const ai = PRIORITY_ARGS.indexOf(a);
    const bi = PRIORITY_ARGS.indexOf(b);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return 0;
  });

  const parts: string[] = [];
  for (const [key, value] of sorted) {
    if (parts.length >= 2) break;
    const val = typeof value === "string" ? value : JSON.stringify(value);
    const display = val.length > 30 ? val.slice(0, 27) + "..." : val;
    parts.push(`${key}: ${display}`);
  }
  return parts.join("  ");
}

function formatOutput(output: string): string {
  const trimmed = output.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      return JSON.stringify(JSON.parse(trimmed), null, 2);
    } catch {
      return output.length > 3000 ? output.slice(0, 3000) + "\n..." : output;
    }
  }
  return output.length > 3000 ? output.slice(0, 3000) + "\n..." : output;
}

export type McpToolProps = {
  /** "completed" → past-tense title with output panel; "pending" → "Preparing X" shimmer; "interrupted" → "X interrupted" muted span. */
  state?: "completed" | "pending" | "interrupted";
  /** MCP tool display name (e.g. "List Resources"). Verb is conjugated to past tense for completed state, prefixed with "Preparing " for pending. */
  displayName: string;
  /** Tool arguments — first 2 (sorted by priority) shown as subtitle "key: value  key2: value2". */
  args?: Record<string, string | number | boolean | null | undefined>;
  /** Tool output — JSON string is pretty-printed; plain text rendered as-is. Truncated to 3000 chars. */
  output?: string;
  /** Initial expand state when output is present. */
  defaultOpen?: boolean;
  /** Controlled expand state (pair with `onToggleExpand`). */
  expanded?: boolean;
  onToggleExpand?: () => void;
  className?: string;
};

export const McpTool = React.memo(function McpTool({
  state = "completed",
  displayName,
  args,
  output,
  defaultOpen = false,
  expanded,
  onToggleExpand,
  className,
}: McpToolProps) {
  React.useEffect(() => {
    ensureShimmerStyles();
  }, []);

  const isControlled = expanded !== undefined;
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const isOpen = isControlled ? !!expanded : internalOpen;

  if (state === "interrupted") {
    return (
      <div
        className={cn(
          "flex items-center max-w-full select-none gap-1",
          className,
        )}
      >
        <span className="text-sm text-neutral-500 dark:text-neutral-400 font-[450]">
          {displayName} interrupted
        </span>
      </div>
    );
  }

  const isPending = state === "pending";
  const title = isPending
    ? `Preparing ${displayName}`
    : getCompletedTitle(displayName);
  const subtitle = isPending ? "" : formatMcpArgs(args);
  const formattedOutput = !isPending && output ? formatOutput(output) : "";
  const expandable = !isPending && !!formattedOutput;

  const handleToggle = () => {
    if (!expandable) return;
    if (isControlled) {
      onToggleExpand?.();
    } else {
      setInternalOpen((v) => !v);
    }
  };

  return (
    <div className={cn("flex flex-col gap-2 w-full", className)}>
      <button
        type="button"
        onClick={handleToggle}
        disabled={!expandable}
        aria-expanded={expandable ? isOpen : undefined}
        className={cn(
          "group flex items-center max-w-full select-none gap-1 bg-transparent border-0 p-0 m-0 text-left",
          expandable ? "cursor-pointer" : "cursor-default",
        )}
      >
        <div className="flex items-center gap-2 min-w-0 text-sm text-neutral-500 dark:text-neutral-400">
          <span className="font-[450] whitespace-nowrap shrink-0">
            {isPending ? (
              <span className="an-mcp-shimmer">{title}</span>
            ) : (
              title
            )}
          </span>
          {subtitle && (
            <span className="font-normal truncate min-w-0 flex-1 text-neutral-400 dark:text-neutral-500/80">
              {subtitle}
            </span>
          )}
        </div>
        {expandable && (
          <IconChevronRight
            className={cn(
              "shrink-0 text-neutral-500 dark:text-neutral-400 transition-transform duration-150 ease-out size-3",
              isOpen ? "rotate-90" : "rotate-0",
            )}
          />
        )}
      </button>
      {expandable && isOpen && (
        <div className="rounded-[10px] overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
          <pre className="m-0 p-3 text-[12px] leading-[1.5] font-mono text-neutral-800 dark:text-neutral-200 overflow-x-auto whitespace-pre">
            {formattedOutput}
          </pre>
        </div>
      )}
    </div>
  );
});
