const TranscriptionList = ({ transcriptionList }) => {
  return (
    <div className="w-full h-full bg-gray-800 p-6 rounded-lg shadow-lg overflow-y-auto"> {/* Increased padding */}
      <h2 className="text-4xl font-bold text-white mb-4 border-b-2 border-gray-700 pb-2"> {/* Larger heading size */}
        Transcriptions
      </h2>
      <ul className="space-y-4"> {/* Increased spacing for better separation */}
        {transcriptionList.length > 0 ? (
          transcriptionList.map((transcription, index) => (
            <li
              key={index}
              className="relative p-4 rounded-lg shadow-md bg-gray-700 transition-transform duration-300 ease-in-out transform hover:scale-105 hover:bg-gray-600" // Hover effect for better interaction
            >
              <div className="flex flex-col">
                <span className="text-white text-lg font-semibold">{transcription.text}</span>
                <span className="text-gray-400 text-sm mt-1">{transcription.time}</span>
              </div>
            </li>
          ))
        ) : (
          <li className="text-gray-400 text-lg">No transcriptions available.</li>
        )}
      </ul>
    </div>
  );
};

export default TranscriptionList;
