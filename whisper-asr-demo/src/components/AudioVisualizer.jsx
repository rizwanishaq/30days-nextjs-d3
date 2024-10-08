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

      // Create a gradient for the waveform
      const gradient = canvasCtx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#ff0080');
      gradient.addColorStop(0.5, '#ff8c00');
      gradient.addColorStop(1, '#00bfff');

      // Set styles for the waveform
      canvasCtx.lineWidth = 3;
      canvasCtx.strokeStyle = gradient;

      canvasCtx.beginPath();
      const sliceWidth = canvas.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0; // Normalize the value
        const y = (v * canvas.height) / 2; // Scale to canvas height

        if (i === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          canvasCtx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      canvasCtx.lineTo(canvas.width, canvas.height / 2);
      canvasCtx.stroke();

      // Draw a glowing effect around the waveform
      canvasCtx.shadowColor = 'rgba(255, 255, 255, 0.5)';
      canvasCtx.shadowBlur = 10;
      canvasCtx.stroke();

      // Draw a grid for better visibility
      drawGrid(canvasCtx, canvas.width, canvas.height);
    };

    const drawGrid = (ctx, width, height) => {
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 0.5;

      for (let i = 0; i < width; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
      }

      for (let i = 0; i < height; i += 20) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(width, i);
        ctx.stroke();
      }

      ctx.restore();
    };

    draw();

    return () => {
      audioInput.disconnect(analyser);
    };
  }, [audioInput, audioContext, isAudioStarted]);

  return (
    <div className="relative w-full h-40 my-4"> {/* Updated margins */}
      <canvas ref={canvasRef} className="w-full h-full bg-gray-900 rounded-lg shadow-lg" />
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 opacity-30 rounded-lg blur-lg"></div>
    </div>
  );
}
