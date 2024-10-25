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
  const [selectedOption, setSelectedOption] = useState<string>(""); // Selected option
  const [message, setMessage] = useState<string>("");
  const [isOptionSelected, setIsOptionSelected] = useState<boolean>(false); // Tracks if the option is selected

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

  useEffect(() => {
    // This effect runs when the component mounts
    console.log("Component mounted");
    return () => {
      // This cleanup function runs when the component unmounts
      console.log("Component unmounted");
    };
  }, []);

  // Only render the Scanner if we are in the browser and an option is selected
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#18204E]">
      <h1 className="text-4xl font-bold mb-8 text-[#d1a7f5]">
        QR Code Scanner
      </h1>
      <div className="w-full max-w-md p-4 rounded shadow-lg bg-[#8a63d2]">
        <h2 className="text-xl mb-4 text-[#e5bafc]">Select an Option</h2>
        {!isOptionSelected && (
          <select
            className="p-2 border border-gray-300 rounded w-full bg-[#d1a7f5] text-[#18204E]"
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
            <h3 className="text-xl mb-2 text-[#e5bafc]">
              Now scan the QR code for {selectedOption}
            </h3>
            <Scanner
              onScan={handleScan}
              onError={(error) => {
                console.error(error);
                setMessage("Error scanning QR code. Please try again.");
              }}
              // className="w-full"
            />
          </div>
        )}

        {message && <p className="mt-4 text-[#e5bafc]">{message}</p>}
      </div>
    </div>
  );
}
