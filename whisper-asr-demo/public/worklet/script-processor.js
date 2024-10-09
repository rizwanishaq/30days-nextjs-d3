class ScriptProcessor extends AudioWorkletProcessor {
  bufferSize = 4096;
  _bytesWritten = 0;
  _buffer = new Float32Array(this.bufferSize);

  constructor() {
      super();
      this.initBuffer();
  }

  initBuffer() {
      this._bytesWritten = 0;
  }

  isBufferEmpty() {
      return this._bytesWritten === 0;
  }

  isBufferFull() {
      return this._bytesWritten === this.bufferSize;
  }

  process(inputs, outputs, parameters) {
      // Grab the first channel's audio data
      this.append(inputs[0][0]);
      return true;
  }

  append(channelData) {
      if (this.isBufferFull()) {
          this.flush();
      }

      if (!channelData) return;

      for (let i = 0; i < channelData.length; i++) {
          this._buffer[this._bytesWritten++] = channelData[i];
      }
  }

  flush() {
      // Downsample and convert to Int16 before sending to the main thread
      const downsampledData = this.downsampleBuffer(
          this._buffer.slice(0, this._bytesWritten),  // Only the written part of the buffer
          sampleRate,                                 // AudioContext sample rate
          16000                                       // Target sample rate
      );

      // Send the downsampled Int16 data to the main thread
      this.port.postMessage(downsampledData);

      this.initBuffer();
  }

  /**
   * Downsamples an audio buffer to a target sample rate.
   *
   * @param {Float32Array} buffer - The input audio buffer to be downsampled.
   * @param {number} recordSampleRate - The original sample rate of the audio buffer.
   * @param {number} targetSampleRate - The desired target sample rate.
   * @returns {Int16Array} - The downsampled audio buffer converted to Int16Array.
   * @throws Will throw an error if the target sample rate is greater than or equal to the recorded sample rate.
   */
  downsampleBuffer(buffer, recordSampleRate, targetSampleRate) {
      if (targetSampleRate === recordSampleRate) return this.convertFloat32ToInt16(buffer);
      if (targetSampleRate > recordSampleRate) {
          throw new Error("Target sample rate must be lower than recorded sample rate");
      }

      const sampleRateRatio = recordSampleRate / targetSampleRate;
      const newLength = Math.floor(buffer.length / sampleRateRatio);
      const result = new Float32Array(newLength);
      const counts = new Uint32Array(newLength); // Array to keep count for averaging

      let offsetResult = 0;
      let offsetBuffer = 0;

      while (offsetResult < newLength) {
          let nextOffsetBuffer = Math.floor((offsetResult + 1) * sampleRateRatio);
          let accum = 0;

          for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
              accum += buffer[i];
              counts[offsetResult]++;
          }

          result[offsetResult] = counts[offsetResult] > 0 ? accum / counts[offsetResult] : 0; // Avoid division by zero
          offsetResult++;
          offsetBuffer = nextOffsetBuffer;
      }

      return this.convertFloat32ToInt16(result); // Convert downsampled buffer to Int16
  }

  /**
   * Converts a Float32Array to Int16Array.
   *
   * @param {Float32Array} floatArray - The input Float32Array to be converted.
   * @returns {Int16Array} - The resulting Int16Array.
   */
  convertFloat32ToInt16(floatArray) {
      const int16Array = new Int16Array(floatArray.length);
      
      for (let i = 0; i < floatArray.length; i++) {
          // Scale and clamp the float value to the Int16 range
          int16Array[i] = Math.max(-32768, Math.min(32767, Math.floor(floatArray[i] * 32767)));
      }

      return int16Array;
  }
}

registerProcessor("script-processor", ScriptProcessor);
