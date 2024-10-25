"use client";
import { useState, useEffect } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase"; // Import Firestore database

const options = [
  "Oct25_Lunch",
  "Oct25_Dinner",
  "Swag",
  "Badge",
  "Oct26_Breakfast",
  "Oct26_Lunch",
];

export default function App() {
  const [isBrowser, setIsBrowser] = useState(false); // Check if we're in the browser
  const [selectedOption, setSelectedOption] = useState<string>(""); // Selected option
  const [data, setData] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");
  const [isOptionSelected, setIsOptionSelected] = useState<boolean>(false); // Tracks if the option is selected

  useEffect(() => {
    setIsBrowser(typeof window !== "undefined");
  }, []);

  const handleScan = async (detectedCodes: { rawValue: string }[]) => {
    if (detectedCodes && detectedCodes[0]) {
      const qrCodeRaw = detectedCodes[0].rawValue.trim(); // Get and trim the raw QR code value

      // Extract only the part before the pipe (|) symbol
      const qrCode = qrCodeRaw.split("|")[0];

      console.log("qrcode", qrCode);
      if (qrCode) {
        const documentId = `${qrCode}-${selectedOption}`;

        // Check Firestore to see if the user has already scanned for this item
        const docRef = doc(db, "scans", documentId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setMessage(`User already received ${selectedOption}`);
        } else {
          // If not scanned, store the scan record in Firestore
          await setDoc(docRef, {
            qrCode,
            item: selectedOption,
            timestamp: new Date(),
          });
          setMessage(`Selected: ${selectedOption} for QR code ${qrCode}`);
          setData(qrCode); // Store the scanned data if needed
        }
      } else {
        setMessage("QR code is invalid.");
      }
    } else {
      setMessage("No QR code detected.");
    }
  };

  const handleSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOption(e.target.value);
    setIsOptionSelected(true); // Lock the option after selection
    setMessage(""); // Reset the message when a new option is selected
  };

  // Only render the Scanner if we are in the browser and an option is selected
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-8">QR Code Scanner</h1>
      <div className="w-full max-w-md p-4 bg-white rounded shadow-lg">
        <h2 className="text-xl mb-4">Select an Option</h2>
        {!isOptionSelected && (
          <select
            className="p-2 border border-gray-300 rounded w-full"
            value={selectedOption}
            onChange={handleSelection}
          >
            <option value="">Select an option</option>
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        )}

        {isOptionSelected && (
          <div className="mt-4">
            <h3 className="text-xl mb-2">
              Now scan the QR code for {selectedOption}
            </h3>
            <Scanner
              onScan={handleScan}
              onError={(error) => console.error(error)}
              style={{ width: "100%" }}
            />
          </div>
        )}

        {message && <p className="mt-4 text-red-500">{message}</p>}
      </div>
    </div>
  );
}
