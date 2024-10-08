'use client';
import { useState, useEffect, useRef } from 'react';
import { start_asr, stop_asr, process_audio_chunk } from '@/app/actions/ASRactions';
import { downsampleBuffer } from '@/lib/utils';
import AudioVisualizer from '@/components/AudioVisualizer';
import TranscriptionList from '@/components/TranscriptionList'; // Import the new component

export default function AudioClient() {
  const [transcriptionList, setTranscriptionList] = useState([]);
  const [isAudioStarted, setIsAudioStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const audioCtxRef = useRef(null);
  const audioChunkBuffer = useRef([]);
  const [audioInput, setAudioInput] = useState(null);

  const startOrStop = async (start, stop) => {
    if (start) {
      await start_asr();
    } else if (stop) {
      await stop_asr();
    }
  };

  const startAudio = async () => {
    if (typeof window !== 'undefined') {
      setLoading(true);
      await startOrStop(true, false);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = audioContext;

      const audioInputNode = audioContext.createMediaStreamSource(stream);
      setAudioInput(audioInputNode);

      await audioContext.audioWorklet.addModule("/worklet/script-processor.js");

      const recorder = new AudioWorkletNode(audioContext, "script-processor");
      recorder.port.onmessage = (e) => {
        const inputAudioChunk = e.data;
        const downsampledData = downsampleBuffer(inputAudioChunk, audioContext.sampleRate, 16000);
        audioChunkBuffer.current.push(Array.from(downsampledData));
      };

      audioInputNode.connect(recorder);
      recorder.connect(audioContext.destination);

      setLoading(false);
      setIsAudioStarted(true);
    }
  };

  const stopAudio = () => {
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
      setIsAudioStarted(false);
    }

    startOrStop(false, true);
  };

  useEffect(() => {
    const processingInterval = setInterval(async () => {
      if (isAudioStarted && audioChunkBuffer.current.length > 0) {
        const chunkToProcess = audioChunkBuffer.current.shift();
        const response = await process_audio_chunk(chunkToProcess);
        if (response?.transcription) {
          const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          setTranscriptionList((prevList) => [...prevList, { text: response.transcription, time: currentTime }]);
        }
      }
    }, 50);

    return () => {
      clearInterval(processingInterval);
    };
  }, [isAudioStarted]);

  return (
    <div className="relative w-full h-screen flex flex-col lg:flex-row bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white">
      <div className="flex flex-col w-full lg:w-2/3 items-center justify-center py-8 pt-24"> {/* Added padding-top (pt-24) */}
        <h1 className="text-5xl font-bold mb-8 drop-shadow-lg">Real-time Transcription</h1>
        {!isAudioStarted ? (
          <div className="flex flex-col items-center justify-center h-3/4">
            {loading ? (
              <div className="spinner-border text-white animate-spin w-16 h-16"></div>
            ) : (
              <button
                onClick={startAudio}
                className="relative group bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 text-white px-8 py-4 rounded-full shadow-2xl hover:shadow-green-500/50 transition-all duration-300 ease-in-out transform hover:scale-110 hover:rotate-3"
              >
                <svg
                  className="w-8 h-8 mr-2 inline-block animate-pulse"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 3v18M19 3v18M12 5l6 6-6 6"
                  ></path>
                </svg>
                Start Recording
                <span className="absolute inset-0 rounded-full bg-white opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-20"></span>
              </button>
            )}
          </div>
        ) : (
          <div className="w-full flex-1 flex flex-col items-center">
            <AudioVisualizer audioInput={audioInput} audioContext={audioCtxRef.current} isAudioStarted={isAudioStarted} />
            <button
              onClick={stopAudio}
              className="relative group bg-red-600 text-white px-8 py-4 rounded-full shadow-2xl hover:shadow-red-500/50 transition-all duration-300 ease-in-out transform hover:scale-110 hover:rotate-3 mt-8"
            >
              <svg
                className="w-8 h-8 mr-2 inline-block"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M18.364 18.364a9 9 0 11-12.728 0 9 9 0 0112.728 0zM15 10l-6 6m0-6l6 6"
                ></path>
              </svg>
              Stop Recording
              <span className="absolute inset-0 rounded-full bg-white opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-20"></span>
            </button>
          </div>
        )}
      </div>

      {/* Transcription List */}
      <div className="w-full lg:w-1/3 p-4 mt-6 lg:mt-0">
        <TranscriptionList transcriptionList={transcriptionList} />
      </div>
    </div>
  );
}
