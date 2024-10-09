'use client';
import { useState, useEffect, useRef } from 'react';
import { start_asr, stop_asr, process_audio_chunk } from '@/app/actions/ASRactions';
import TranscriptionList from '@/components/TranscriptionList';
import { MdMic, MdStop } from 'react-icons/md';

export default function AudioClient() {
  const [transcriptionList, setTranscriptionList] = useState([]);
  const [isAudioStarted, setIsAudioStarted] = useState(false);
  const audioCtxRef = useRef(null);
  const audioChunkBuffer = useRef([]);
  const transcriptionListRef = useRef(null); // Reference for scrolling
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
        const downsampledData = e.data;
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
          // Prepend new transcriptions to the list to reverse order
          setTranscriptionList((prevList) => [{ text: response.transcription, time: currentTime }, ...prevList]);
        }
      }
    }, 50);

    return () => {
      clearInterval(processingInterval);
    };
  }, [isAudioStarted]);

  // Scroll to the last message when the transcription list updates
  useEffect(() => {
    if (transcriptionListRef.current) {
      transcriptionListRef.current.scrollTop = transcriptionListRef.current.scrollHeight;
    }
  }, [transcriptionList]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-4 overflow-hidden flex flex-col">
        <h1 className="text-4xl font-bold mb-2 drop-shadow-lg">Real-time Transcription</h1>

        {/* Scrollable Transcription List with fixed height */}
        <div ref={transcriptionListRef} className="flex-1 overflow-y-auto max-h-[60vh] bg-white rounded-lg shadow-md border border-gray-300 p-4">
          <TranscriptionList transcriptionList={transcriptionList} />
        </div>
      </div>

      {/* Control Button at the Bottom */}
      <div className="flex justify-center items-center p-4 bg-gray-800 border-t border-gray-700">
        <div className="flex justify-center items-center space-x-4">
          {!isAudioStarted ? (
            <button
              onClick={startAudio}
              className="p-2 bg-green-500 rounded-full shadow-md hover:bg-green-400 transition duration-300"
            >
              <MdMic className="h-6 w-6 text-white" />
            </button>
          ) : (
            <button
              onClick={stopAudio}
              className="p-2 bg-red-500 rounded-full shadow-md hover:bg-red-400 transition duration-300"
            >
              <MdStop className="h-6 w-6 text-white" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
