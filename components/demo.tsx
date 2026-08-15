import { McpTool } from "@/components/ui/mcp-tool";

export default function Demo() {
  return (
    <div className="flex items-center justify-center w-full min-h-screen bg-background p-8 overflow-hidden">
      <div className="w-full max-w-md">
        <McpTool
          displayName="List Resources"
          args={{ query: "resources" }}
          output={JSON.stringify(
            [
              { id: "res_1", name: "Billing" },
              { id: "res_2", name: "Support" },
            ],
            null,
            2,
          )}
          defaultOpen
        />
      </div>
    </div>
  );
}
