import AudioClient from "@/components/AudioClient";

export default async function Home() {
  return (
    <div className="flex flex-col items-center bg-gray-100 pt-24 h-screen">
      <AudioClient />
    </div>
  );
}
