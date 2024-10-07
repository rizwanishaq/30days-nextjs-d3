'use server';
import StreamingASR from "@/lib/StreamASR";
import { generateUniqueSequenceId } from "@/lib/utils";

/**
 * The current StreamingASR instance.
 * 
 * This variable holds the active StreamingASR instance.
 */
let streamingASR = null;

/**
 * Starts the ASR session.
 * 
 * This function creates a new instance of StreamingASR and initiates the 
 * automatic speech recognition (ASR) process by calling the start method.
 *
 * @returns {Promise<any>} - The response from the ASR service after starting the session.
 */
export async function start_asr() {
    const sequenceId = generateUniqueSequenceId(); // Generate a unique sequence ID
    streamingASR = new StreamingASR("integrator", sequenceId); // Create a new instance

    const response = await streamingASR.start(); // Start the ASR session
    console.log(response);
    return response;
}

/**
 * Stops the ASR session.
 * 
 * This function terminates the automatic speech recognition (ASR) process by 
 * calling the stop method of the StreamingASR instance and sets it to null.
 *
 * @returns {Promise<any>} - The response from the ASR service after stopping the session.
 */
export async function stop_asr() {
    if (streamingASR) {
        const response = await streamingASR.stop(); // Stop the ASR session
        console.log(response);
        streamingASR = null; // Reset the StreamingASR instance
        return response;
    } else {
        console.log("No active ASR session to stop.");
        return null;
    }
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
    if (!streamingASR) {
        console.log("StreamingASR instance is not active. Cannot process audio chunk.");
        return null; // Early exit if no active instance
    }

    data = new Int16Array(data); // Ensure data is in Int16 format
    data = Buffer.from(data.buffer); // Convert the data to a Buffer
    const response = await streamingASR.processAudioChunk(data);
    return response;
}
