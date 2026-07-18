export default function ChatSidebar() {
  return (
    <aside className="novaSidebar">

      <button className="newChatBtn">
        + New Chat
      </button>

      <div className="chatHistory">

        <div className="historyItem active">
          📘 Software Engineering
        </div>

        <div className="historyItem">
          🤖 AI Fundamentals
        </div>

        <div className="historyItem">
          📐 Linear Algebra
        </div>

        <div className="historyItem">
          🌐 English
        </div>

      </div>

    </aside>
  );
}