type MessagePart = {
  type?: string;
  text?: string;
};

type ChatMessage = {
  role?: string;
  parts?: MessagePart[];
};

export function extractLatestAssistantText(messages: ChatMessage[]): string {
  const latestAssistant = [...messages]
    .reverse()
    .find((message) => message.role === "assistant");

  if (!latestAssistant) {
    return "";
  }

  return (latestAssistant.parts ?? [])
    .filter((part) => part.type === "text" && typeof part.text === "string")
    .map((part) => part.text)
    .join("\n")
    .trim();
}
