// AudioClient.js

'use client';
import { useState, useEffect, useRef } from 'react';
import { start_asr, stop_asr, process_audio_chunk } from '@/app/actions/ASRactions';
import { downsampleBuffer } from '@/lib/utils';

export default function AudioClient() {
  const [transcription, setTranscription] = useState("");
  const [isAudioStarted, setIsAudioStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const audioCtxRef = useRef(null);
  const audioChunkBuffer = useRef([]); // Buffer for storing audio chunks
  const processingIntervalRef = useRef(null); // Ref to store the processing interval

  const startOrStop = async (start, stop) => {
    if (start) {
      await start_asr();
    } else if (stop) {
      await stop_asr();
    }
  };

  const processAudioChunk = async (inputAudioChunk) => {
    const response = await process_audio_chunk(inputAudioChunk);
    if (response.transcription) {
      setTranscription(response.transcription);
    }
  };

  const startAudio = async () => {
    if (typeof window !== 'undefined') {
      setLoading(true);
      await startOrStop(true, false);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = audioContext;

      const audioInput = audioContext.createMediaStreamSource(stream);
      await audioContext.audioWorklet.addModule("/worklet/script-processor.js");

      const recorder = new AudioWorkletNode(audioContext, "script-processor");
      recorder.port.onmessage = (e) => {
        const inputAudioChunk = e.data; // Get the audio data from the worklet
        const downsampledData = downsampleBuffer(inputAudioChunk, audioContext.sampleRate, 16000); // Downsample to 16kHz
        audioChunkBuffer.current.push(Array.from(downsampledData)); // Store the audio chunk in the buffer
      };

      audioInput.connect(recorder);
      recorder.connect(audioContext.destination);

      // Start processing audio chunks every 100ms
      processingIntervalRef.current = setInterval(() => {
        if (audioChunkBuffer.current.length > 0) {
          const chunkToProcess = audioChunkBuffer.current.shift(); // Get the oldest chunk
          processAudioChunk(chunkToProcess); // Process the chunk
        }
      }, 100); // Process every 100ms

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

    // Clear the interval when audio stops
    if (processingIntervalRef.current) {
      clearInterval(processingIntervalRef.current);
      processingIntervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
      // Clear the interval if component unmounts
      if (processingIntervalRef.current) {
        clearInterval(processingIntervalRef.current);
      }
    };
  }, []);

  return (
    <div className="w-full h-screen flex flex-col items-center bg-gray-100">
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
          {transcription && (
            <div className="flex flex-col items-center justify-center h-3/4">
              <p className="text-lg font-bold text-gray-700">{transcription}</p>
            </div>
          )}
          <button
            onClick={stopAudio}
            className="bg-red-500 text-white px-6 py-3 rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 mt-4"
          >
            Stop Audio
          </button>
        </div>
      )}
    </div>
  );
}
