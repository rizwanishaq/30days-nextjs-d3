// components/Footer.js

export default function Footer() {
    return (
      <footer className="bg-gradient-to-r from-gray-800 to-gray-900 p-8 mt-8 rounded-t-lg shadow-lg">
        <div className="flex flex-col items-center">
          <p className="text-gray-300 text-center text-base mb-2">© 2024 RiisBiTech. All rights reserved.</p>
          <p className="text-gray-400 text-center text-sm mb-4">Crafted with ❤️ by RiisBi</p>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-300 hover:text-white transition duration-300">Privacy Policy</a>
            <a href="#" className="text-gray-300 hover:text-white transition duration-300">Terms of Service</a>
            <a href="#" className="text-gray-300 hover:text-white transition duration-300">Contact Us</a>
          </div>
        </div>
      </footer>
    );
  }
  