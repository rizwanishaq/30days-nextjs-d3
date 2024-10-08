// components/Header.js

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-purple-500 to-blue-500 p-6 shadow-md fixed top-0 left-0 w-full z-10 flex items-center justify-between">
      {/* Logo Section */}
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10">
          {/* SVG Microphone Icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
            fill="white"
            viewBox="0 0 24 24"
          >
            <path d="M12 14c1.104 0 2-.896 2-2V4c0-1.104-.896-2-2-2s-2 .896-2 2v8c0 1.104.896 2 2 2zm-2 8c-1.104 0-2 .896-2 2h8c0-1.104-.896-2-2-2h-4zM16 4c0-1.104.896-2 2-2s2 .896 2 2v8c0 1.104-.896 2-2 2s-2-.896-2-2V4zm-8 0c0-1.104-.896-2-2-2s-2 .896-2 2v8c0 1.104.896 2 2 2s2-.896 2-2V4z" />
          </svg>
        </div>
        <div>
          <h1 className="text-3xl text-white font-bold">Transform Your Audio Experience</h1>
          <p className="text-sm text-white">
            Unleash the power of voice with our cutting-edge real-time transcription technology, designed to provide instant and accurate text conversion for any audio input.
          </p>
        </div>
      </div>
    </header>
  );
}
