import ChatLayout from "@/components/chat/chat-layout";

export default function Home() {
  return (
    <div className="h-screen w-full overflow-hidden bg-background">
      <ChatLayout defaultLayout={[25, 75]} />
    </div>
  );
}
