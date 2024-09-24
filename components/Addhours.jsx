"use client";
import { useState } from "react";

export default function Addhours() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [hours, setHours] = useState("");

  const handleOpenPopup = () => {
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // Add logic for submitting hours
    console.log("Submitted Hours:", hours);
    setHours(""); // Clear the input after submission
    setIsPopupOpen(false); // Close popup after submission
  };

  const handleMonthCompleted = () => {
    // Add logic for month completed
    console.log("Month Completed!");
    setIsPopupOpen(false); // Close popup after action
  };

  return (
    <div className="grid place-items-center h-screen">
      <div className="shadow-lg p-8 bg-zinc-300/10 flex flex-col gap-2 my-6">
        {/* Main page content */}
        <button
          onClick={handleOpenPopup}
          className="bg-blue-500 text-white font-bold px-6 py-2 mt-3"
        >
          Enter Hours
        </button>
      </div>

      {/* Popup Modal */}
      {isPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Enter Hours</h3>
              <button onClick={handleClosePopup} className="text-red-500">
                &#10005; {/* Close (X) button */}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-gray-700 mb-2">Hours Worked</label>
                <input
                  type="number"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="Enter hours"
                  required
                />
              </div>

              <div className="flex justify-between gap-4">
                <button
                  type="button"
                  onClick={handleMonthCompleted}
                  className="bg-green-500 text-white font-bold px-4 py-2 rounded hover:bg-green-600"
                >
                  Month Completed
                </button>

                <button
                  type="submit"
                  className="bg-blue-500 text-white font-bold px-4 py-2 rounded hover:bg-blue-600"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}