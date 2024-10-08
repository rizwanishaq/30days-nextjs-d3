// components/TranscriptionList.js
const TranscriptionList = ({ transcriptionList }) => {
  return (
    <div
      className="w-full h-full bg-gray-800 p-6 rounded-lg shadow-lg overflow-y-auto"
    >
      <h2 className="text-3xl font-bold text-white mb-4 border-b-2 border-gray-700 pb-2">
        Transcriptions
      </h2>
      <ul className="space-y-2">
        {transcriptionList.length > 0 ? (
          transcriptionList.map((transcription, index) => (
            <li
              key={index}
              className="relative p-4 rounded-md shadow-md bg-gray-700 transition-transform duration-300 ease-in-out transform hover:scale-105"
            >
              <div className="flex flex-col">
                <span className="text-white text-lg">
                  {transcription.text}
                </span>
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
