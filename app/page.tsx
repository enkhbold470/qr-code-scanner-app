"use client";
import { useState, useEffect } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import localforage from "localforage";

const options = [
  "Oct25 Lunch",
  "Oct25 Dinner",
  "Swag",
  "Badge",
  "Oct26 Breakfast",
];

export default function App() {
  const [isBrowser, setIsBrowser] = useState(false); // Check if we're in the browser
  const [data, setData] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    // This ensures that the code only runs in the browser and not during SSR
    setIsBrowser(typeof window !== "undefined");
  }, []);

  const handleScan = async (detectedCodes: { rawValue: string }[]) => {
    if (detectedCodes && detectedCodes[0]) {
      const result = detectedCodes[0].rawValue;
      const alreadyScanned = await localforage.getItem<string>(result);
      if (alreadyScanned) {
        setMessage(`User already received ${alreadyScanned}`);
      } else {
        setData(result);
        setMessage("");
      }
    }
  };

  const handleSelection = async () => {
    if (data && selectedOption) {
      await localforage.setItem(data, selectedOption);
      setMessage(`Selected: ${selectedOption} for QR code ${data}`);
      setData(null);
      setSelectedOption("");
    } else {
      setMessage("Please scan a QR code and select an option");
    }
  };

  // Only render the Scanner if we are in the browser
  if (!isBrowser) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-8">QR Code Scanner</h1>
      <div className="w-full max-w-md p-4 bg-white rounded shadow-lg">
        <Scanner
          onScan={handleScan}
          onError={(error) => console.error(error)}
          style={{ width: "100%" }}
        />
        {data && (
          <div className="mt-4">
            <h2 className="text-xl">Scanned QR Code: {data}</h2>
            <select
              className="mt-2 p-2 border border-gray-300 rounded"
              value={selectedOption}
              onChange={(e) => setSelectedOption(e.target.value)}
            >
              <option value="">Select an option</option>
              {options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <button
              className="mt-4 p-2 bg-blue-500 text-white rounded hover:bg-blue-700"
              onClick={handleSelection}
            >
              Confirm Selection
            </button>
          </div>
        )}
        {message && <p className="mt-4 text-red-500">{message}</p>}
      </div>
    </div>
  );
}
