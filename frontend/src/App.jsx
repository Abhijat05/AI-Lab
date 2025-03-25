import ChatBot from './components/ChatBot';

export default function App() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold text-center mb-6 text-white">
          AI Will Take My Job
        </h1>
        <ChatBot />
      </div>
    </div>
  );
}