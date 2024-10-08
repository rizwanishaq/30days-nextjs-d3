// components/AudioVisualizer.js

import { useRef, useEffect } from 'react';

export default function AudioVisualizer({ audioInput, audioContext, isAudioStarted }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!isAudioStarted || !audioInput || !audioContext) return;

    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    audioInput.connect(analyser);

    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext('2d');

    const draw = () => {
      if (!canvas || !canvasCtx) return;

      requestAnimationFrame(draw);

      analyser.getByteTimeDomainData(dataArray);

      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

      canvasCtx.lineWidth = 2;
      canvasCtx.strokeStyle = 'rgb(0, 123, 255)';
      canvasCtx.beginPath();

      const sliceWidth = canvas.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          canvasCtx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      canvasCtx.lineTo(canvas.width, canvas.height / 2);
      canvasCtx.stroke();
    };

    draw();

    return () => {
      audioInput.disconnect(analyser);
    };
  }, [audioInput, audioContext, isAudioStarted]);

  return <canvas ref={canvasRef} className="w-full h-32 mb-4 bg-gray-200 rounded-md"></canvas>;
}
