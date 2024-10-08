'use client';
import { useState, useEffect, useRef } from 'react';
import { start_asr, stop_asr, process_audio_chunk } from '@/app/actions/ASRactions';
import { downsampleBuffer } from '@/lib/utils';
import AudioVisualizer from '@/components/AudioVisualizer'; // Import the new component

export default function AudioClient() {
  const [transcriptionList, setTranscriptionList] = useState([]); // Store transcription as a list
  const [isAudioStarted, setIsAudioStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const audioCtxRef = useRef(null);
  const audioChunkBuffer = useRef([]); // Buffer for storing audio chunks
  const [audioInput, setAudioInput] = useState(null); // Track the audioInput node

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
      setAudioInput(audioInputNode); // Store audio input for visualizer

      await audioContext.audioWorklet.addModule("/worklet/script-processor.js");

      const recorder = new AudioWorkletNode(audioContext, "script-processor");
      recorder.port.onmessage = (e) => {
        const inputAudioChunk = e.data; // Get the audio data from the worklet
        const downsampledData = downsampleBuffer(inputAudioChunk, audioContext.sampleRate, 16000); // Downsample to 16kHz
        audioChunkBuffer.current.push(Array.from(downsampledData)); // Store the audio chunk in the buffer
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

  // Effect for processing audio chunks
  useEffect(() => {
    const processingInterval = setInterval(async () => {
      // Only process audio chunks if audio is still running
      if (isAudioStarted && audioChunkBuffer.current.length > 0) {
        const chunkToProcess = audioChunkBuffer.current.shift(); // Get the oldest chunk

        // Process the audio chunk
        const response = await process_audio_chunk(chunkToProcess);
        if (response?.transcription) {
          setTranscriptionList((prevList) => [...prevList, response.transcription]); // Add transcription to the list
        }
      }
    }, 50); // Process every 5ms

    return () => {
      clearInterval(processingInterval); // Clean up the interval on unmount or stop
    };
  }, [isAudioStarted]); // Run this effect when audio starts or stops

  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  return (
    <div className="w-full h-screen flex flex-row bg-gray-100">
      <div className="flex flex-col w-2/3 items-center justify-center">
        <h1 className="text-4xl font-bold text-gray-700 my-4">Real-time Transcription</h1>
        {!isAudioStarted ? (
          <div className="flex flex-col items-center justify-center h-3/4">
            {loading ? (
              <div className="spinner-border text-blue-500 animate-spin w-16 h-16"></div>
            ) : (
              <button
                onClick={startAudio}
                className="bg-blue-500 text-white px-6 py-3 rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105"
              >
                Start Audio
              </button>
            )}
          </div>
        ) : (
          <div className="w-full flex-1 flex flex-col items-center">
            {/* Use AudioVisualizer Component */}
            <AudioVisualizer audioInput={audioInput} audioContext={audioCtxRef.current} isAudioStarted={isAudioStarted} />
            <button
              onClick={stopAudio}
              className="bg-red-500 text-white px-6 py-3 rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 mt-4"
            >
              Stop Audio
            </button>
          </div>
        )}
      </div>

      {/* Transcription List */}
      <div className="w-1/3 h-full bg-white p-4 overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Transcriptions</h2>
        <ul>
          {transcriptionList.map((transcription, index) => (
            <li key={index} className="mb-2 text-gray-600">
              {index + 1}. {transcription}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
