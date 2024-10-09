// components/AudioVisualizer.jsx
import { useEffect, useRef } from 'react';

const AudioVisualizer = ({ audioContext, audioInput }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const audioLevelRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    let analyzerNode;
    let dataArray;
    let bufferLength;

    if (audioContext && audioInput) {
      const analyzer = audioContext.createAnalyser();
      analyzer.fftSize = 256;
      bufferLength = analyzer.frequencyBinCount;
      dataArray = new Uint8Array(bufferLength);

      // Connect the audio input to the analyser
      audioInput.connect(analyzer);
      analyzerNode = analyzer;

      // Function to draw the visualizer bar
      const drawVisualizer = () => {
        if (!analyzerNode) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Get frequency data
        analyzerNode.getByteFrequencyData(dataArray);

        // Calculate the audio level (amplitude)
        const amplitude = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
        audioLevelRef.current = amplitude;

        // Draw the background bar
        ctx.fillStyle = '#222'; // Dark grey background
        const barHeight = 20;
        ctx.fillRect(50, canvas.height / 2 - barHeight / 2, canvas.width - 100, barHeight);

        // Draw the active level on the bar
        ctx.fillStyle = '#00ffff'; // Cyan active level color
        const barWidth = ((canvas.width - 100) * amplitude) / 255; // Normalize amplitude to canvas width
        ctx.fillRect(50, canvas.height / 2 - barHeight / 2, barWidth, barHeight);

        animationRef.current = requestAnimationFrame(drawVisualizer);
      };

      drawVisualizer();
    }

    return () => {
      if (analyzerNode) {
        analyzerNode.disconnect();
      }
      cancelAnimationFrame(animationRef.current);
    };
  }, [audioContext, audioInput]);

  return (
    <div className="flex flex-col items-center">
      {/* Canvas Bar Visualizer */}
      <canvas
        ref={canvasRef}
        className="w-full h-6 bg-black rounded-full shadow-lg"
      ></canvas>

    
    </div>
  );
};

export default AudioVisualizer;
