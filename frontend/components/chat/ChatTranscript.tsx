import ChatMessage from "./ChatMessage";

type Message = {
  id: string;
  senderType: string;
  messageText: string;
  createdAt: string;
};

type Props = {
  messages: Message[];
};

export default function ChatTranscript({ messages }: Props) {
  return (
    <div className="transcript">
      {messages.map((msg) => (
        <ChatMessage key={msg.id} message={msg} />
      ))}

      <style jsx>{`
        .transcript {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
      `}</style>
    </div>
  );
}

