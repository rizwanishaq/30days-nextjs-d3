// components/TranscriptionList.js
const TranscriptionList = ({ transcriptionList }) => {
    return (
      <div
        className="w-full h-full bg-gray-900 p-6 rounded-lg shadow-lg overflow-y-auto"
        style={{ maxHeight: 'calc(100vh - 200px)', marginTop: '20px' }} // Added marginTop for spacing
      >
        <h2 className="text-3xl font-bold text-white mb-4 border-b-2 border-gray-700 pb-2">
          Transcriptions
        </h2>
        <ul className="space-y-2">
          {transcriptionList.length > 0 ? (
            transcriptionList.map((transcription, index) => (
              <li
                key={index}
                className="relative p-4 rounded-md shadow-md bg-gray-800 transition-transform duration-300 ease-in-out transform hover:scale-105 hover:bg-gray-700"
              >
                <div className="flex justify-between items-center">
                  <span className="text-white text-lg">
                    {index + 1}. {transcription.text}
                  </span>
                </div>
                <span className="text-gray-400 text-sm mt-1">{transcription.time}</span>
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
  