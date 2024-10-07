import crypto from "crypto";

/**
 * Converts a buffer to an Int16Array.
 * @param {Buffer} buffer - The input buffer.
 * @returns {Int16Array} The resulting Int16Array.
 */
const bufferToInt16 = (buffer) => {
  return new Int16Array(buffer.buffer, buffer.byteOffset, buffer.length / 2);
};

/**
 * Generates a unique sequence ID.
 * @returns {BigInt} - A unique sequence ID.
 */
const generateUniqueSequenceId = () => {
  const timestamp = BigInt(Date.now() * 1000); // Convert to BigInt directly
  const randomBytes = crypto.randomBytes(4); // Generate 4 random bytes
  const randomNum = BigInt("0x" + randomBytes.toString("hex")); // Convert to BigInt
  return Number(timestamp + randomNum);
};

/**
 * Converts a string to a buffer with a 4-byte length prefix.
 *
 * @param {string} str - The input string.
 * @returns {Buffer} The resulting buffer.
 */
function stringToBuffer(str) {
  // Allocate a 4-byte buffer to store the length of the string
  const lengthBuffer = Buffer.alloc(4);

  // Write the length of the string to the buffer
  lengthBuffer.writeUInt32LE(Buffer.from(str, "utf8").length, 0);

  // Concatenate the length buffer with the buffer from the string
  return Buffer.concat([lengthBuffer, Buffer.from(str, "utf8")]);
}

/**
 * Converts a boolean value to a buffer.
 * @param {boolean} value - The boolean value.
 * @returns {Buffer} The resulting buffer.
 */
function boolToBuffer(value) {
  return Buffer.from([value ? 1 : 0]);
}

/**
 * Converts an integer value to a buffer.
 * @param {number} value - The integer value.
 * @returns {Buffer} The resulting buffer.
 */
function intToBuffer(value) {
  return Buffer.from(new Int32Array([value]).buffer);
}

/**
 * Creates a dictionary of NLPEncoding types from the provided protoDescriptor.
 *
 * @param {Object} protoDescriptor - The protoDescriptor object containing NLPEncoding types.
 * @returns {Object} - A dictionary mapping NLPEncoding type names to their corresponding numbers.
 */
function createNLPEncodingTypesDictionary(protoDescriptor) {
  return protoDescriptor.utopia.loquista.asr.NLPEncoding.type.value.reduce(
    (nlpTypes, type) => {
      nlpTypes[type.name] = type.number;
      return nlpTypes;
    },
    {}
  );
}



/**
 * Downsamples an audio buffer to a target sample rate.
 *
 * @param {Float32Array} buffer - The input audio buffer to be downsampled.
 * @param {number} recordSampleRate - The original sample rate of the audio buffer.
 * @param {number} targetSampleRate - The desired target sample rate.
 * @returns {Float32Array} - The downsampled audio buffer.
 * @throws Will throw an error if the target sample rate is greater than or equal to the recorded sample rate.
 */
function downsampleBuffer(buffer, recordSampleRate, targetSampleRate) {
  if (targetSampleRate === recordSampleRate) return buffer;
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

  return convertFloat32ToInt16(result);
}

/**
 * Converts a Float32Array to Int16Array.
 *
 * @param {Float32Array} floatArray - The input Float32Array to be converted.
 * @returns {Int16Array} - The resulting Int16Array.
 */
function convertFloat32ToInt16(floatArray) {
  const int16Array = new Int16Array(floatArray.length);
  
  for (let i = 0; i < floatArray.length; i++) {
    // Scale and clamp the float value to the Int16 range
    int16Array[i] = Math.max(-32768, Math.min(32767, Math.floor(floatArray[i] * 32767)));
  }

  return int16Array;
}

export {
  downsampleBuffer,
  bufferToInt16,
  generateUniqueSequenceId,
  stringToBuffer,
  boolToBuffer,
  intToBuffer,
  createNLPEncodingTypesDictionary,
};
