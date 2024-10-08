'use client';
import { useState, useEffect, useRef } from 'react';
import { start_asr, stop_asr, process_audio_chunk } from '@/app/actions/ASRactions';
import { downsampleBuffer } from '@/lib/utils';
import AudioVisualizer from '@/components/AudioVisualizer';
import TranscriptionList from '@/components/TranscriptionList'; // Import the new component
import { MdMic, MdStop } from 'react-icons/md'; // Importing microphone and stop icons

export default function AudioClient() {
  const [transcriptionList, setTranscriptionList] = useState([]);
  const [isAudioStarted, setIsAudioStarted] = useState(false);
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
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <div className="flex-1 p-6 overflow-hidden flex flex-col">
        <h1 className="text-5xl font-bold mb-4 drop-shadow-lg">Real-time Transcription</h1>
        
        {/* Scrollable Transcription List */}
        <div className="flex-1 overflow-y-auto">
          <TranscriptionList transcriptionList={transcriptionList} />
        </div>
      </div>

      {/* Fixed Bottom Bar for Visualizer and Control Buttons */}
      <div className="flex justify-center items-center p-4 bg-gray-800 border-t border-gray-700">
        <AudioVisualizer audioInput={audioInput} audioContext={audioCtxRef.current} isAudioStarted={isAudioStarted} />
        <div className="flex justify-center items-center space-x-4 ml-4">
          {!isAudioStarted ? (
            <button
              onClick={startAudio}
              className="p-4 bg-green-500 rounded-full shadow-md hover:bg-green-400 transition duration-300"
            >
              <MdMic className="h-6 w-6 text-white" />
            </button>
          ) : (
            <button
              onClick={stopAudio}
              className="p-4 bg-red-500 rounded-full shadow-md hover:bg-red-400 transition duration-300"
            >
              <MdStop className="h-6 w-6 text-white" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
