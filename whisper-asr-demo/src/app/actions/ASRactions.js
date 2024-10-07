'use server';
import StreamingASR from "@/lib/StreamASR";
import { generateUniqueSequenceId } from "@/lib/utils";

// Generate a unique sequence ID for the ASR session
const sequenceId = generateUniqueSequenceId();
const streamingASR = new StreamingASR("integrator", sequenceId);

/**
 * Starts the ASR session.
 * 
 * This function initiates the automatic speech recognition (ASR) process by 
 * calling the start method of the StreamingASR instance.
 *
 * @returns {Promise<any>} - The response from the ASR service after starting the session.
 */
export async function start_asr() {
    const response = await streamingASR.start();
    console.log(response);
    return response;
}

/**
 * Stops the ASR session.
 * 
 * This function terminates the automatic speech recognition (ASR) process by 
 * calling the stop method of the StreamingASR instance.
 *
 * @returns {Promise<any>} - The response from the ASR service after stopping the session.
 */
export async function stop_asr() {
    const response = await streamingASR.stop();
    console.log(response);
    return response;
}

/**
 * Processes an audio chunk.
 * 
 * This function processes a chunk of audio data by converting the data into 
 * an Int16Array format, then into a Buffer, and finally passing it to the 
 * StreamingASR instance for processing.
 * 
 * @param {ArrayBuffer|TypedArray} data - The raw audio data chunk to be processed.
 * @returns {Promise<any>} - The response from the ASR service after processing the audio chunk.
 */
export async function process_audio_chunk(data) {
    data = new Int16Array(data); // Ensure data is in Int16 format
    data = Buffer.from(data.buffer); // Convert the data to a Buffer
    const response = await streamingASR.processAudioChunk(data);
    return response;
}
