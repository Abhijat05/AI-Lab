import ChatBot from './components/ChatBot';

export default function App() {
  return (
    <div className="min-h-screen w-screen overflow-hidden bg-gradient-to-b from-gray-950 to-gray-900 text-white">
      <div className="h-full flex flex-col">
        <header className="py-4 px-6 text-center flex-shrink-0">
          <h1 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            AI Assistant
          </h1>
          <p className="text-gray-400 text-sm">Powered by OpenRouter AI models</p>
        </header>
        <div className="flex-grow overflow-hidden p-4">
          <ChatBot />
        </div>
      </div>
    </div>
  );
}