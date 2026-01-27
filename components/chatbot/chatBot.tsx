
import ChatClientComponent from "./chatClientComponent";

interface ChatBotProps {
  account?: boolean;
  data: Object | null;
}

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error('GEMINI_API_KEY environment variable is not set');
}

export default function ChatBot({ account, data }: ChatBotProps) {
console.log(account)
  if (account) return;

  if (!account) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <ChatClientComponent data={data} apiKey={apiKey as string} />
      </div>
    );
  }

}
