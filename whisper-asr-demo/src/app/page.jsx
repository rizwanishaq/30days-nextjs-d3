import AudioClient from "@/components/AudioClient";

export default async function Home() {
  return (
    <div className="flex flex-col items-center justify-center bg-gray-100 h-screen">
      <div className="flex items-center justify-center w-full max-w-4xl p-4">
        <div className="flex flex-col w-full h-full bg-gray-900 rounded-lg shadow-lg overflow-hidden">
          <AudioClient />
        </div>
      </div>
    </div>
  );
}
