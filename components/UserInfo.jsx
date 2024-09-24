"use client";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function UserInfo() {
  const { data: session, status } = useSession();
  const [userInfo, setUserInfo] = useState(null);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Memoized function using useCallback to prevent unnecessary re-renders
  const handleFetchUserHours = useCallback(async (email) => {
    try {
      console.log("Fetching hours for:", email);

      const response = await fetch(
        `${window.location.origin}/api/trackhours?email=${encodeURIComponent(
          email
        )}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      if (data && data.trackhours) {
        setUserInfo(data.trackhours);
      }
    } catch (error) {
      console.error("Error fetching user hours:", error);
    }
  }, []); // No dependencies, function will not change

  useEffect(() => {
    if (status === "authenticated" && session?.user?.email) {
      handleFetchUserHours(session.user.email); // Call memoized function
    }
  }, [session, status, handleFetchUserHours]); // Added handleFetchUserHours to dependency array

  const formatDate = (dateString) => {
    if (!dateString) return "Loading...";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US");
  };

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [newHours, setHours] = useState("6");

  const handleOpenPopup = () => {
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    setIsSubmitting(true);

    const hours = parseFloat(userInfo?.hours) + parseFloat(newHours);
    const lastentry = new Date().toISOString();
    const lastmonthhours = parseFloat(userInfo?.lastmonthhours);
    const email = session?.user?.email;

    console.log("Submitted Data:", { hours, lastmonthhours, lastentry, email });

    try {
      const trackhours = await fetch("/api/trackhours", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, lastentry, hours, lastmonthhours }),
      });

      if (!trackhours.ok) {
        throw new Error("Failed to update hours");
      }

      setHours("");
      toast.success("Hours added successfully!");

      setTimeout(() => {
        window.location.reload();
      }, 5000);
    } catch (error) {
      console.error("Error updating hours:", error);
      toast.error("Failed to add hours.");
    } 
  };

  const handleMonthCompleted = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const hours = parseFloat(0);
    const lastentry = userInfo?.lastentry;
    const lastmonthhours = parseFloat(userInfo?.hours);
    const email = session?.user?.email;

    try {
      const trackhours = await fetch("/api/trackhours", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, lastentry, hours, lastmonthhours }),
      });

      if (!trackhours.ok) {
        throw new Error("Failed to update month hours!");
      }

      setHours("");
      setIsSubmitting(true);
      toast.success("Month hours Record successfully!");
    
      setTimeout(() => {
        window.location.reload();
      }, 5000);
    } catch (error) {
      console.error("Error updating month hours:", error);
      toast.error("Failed to update month hours.");
    } 
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-fixed bg-cover"
      style={{
        backgroundImage: "url('https://source.unsplash.com/featured/?nature')",
      }} // Optionally use a high-quality background image
    >
      <div>
        <ToastContainer />
      </div>
      <div className="container mx-auto max-w-md shadow-lg p-8 bg-white/80 backdrop-blur-lg rounded-lg flex flex-col gap-6 my-6">
        <h2 className="text-3xl font-bold text-gray-800 text-center">
          User Information
        </h2>

        <div className="text-lg text-gray-700">
          Hi <span className="font-bold">{session?.user?.name},</span>
        </div>

        <div className="text-lg text-gray-700">
          Email: <span className="font-bold">{session?.user?.email}</span>
        </div>

        <div className="text-lg text-gray-700">
          Total Hours:{" "}
          <span className="font-bold">{userInfo?.hours ?? "Loading..."}</span>
        </div>

        <div className="text-lg text-gray-700">
          Last Entry Date:{" "}
          <span className="font-bold">{formatDate(userInfo?.lastentry)}</span>
        </div>

        <div className="text-lg text-gray-700">
          Last Month Hours:{" "}
          <span className="font-bold">
            {userInfo?.lastmonthhours ?? "Loading..."}
          </span>
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleOpenPopup}
            className="bg-blue-600 text-white font-bold px-6 py-2 rounded-lg hover:bg-blue-700 transition-all"
          >
            Enter Hours
          </button>
        </div>

        <div className="flex justify-center mt-2">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="bg-red-500 text-white font-bold px-6 py-2 rounded-lg hover:bg-red-600 transition-all"
          >
            Log Out
          </button>
        </div>

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
                  <label className="block text-gray-700 mb-2">
                    Hours Worked
                  </label>
                  <input
                    type="number"
                    value={newHours}
                    onChange={(e) => setHours(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="Enter hours"
                    required
                  />
                </div>

                <div className="flex justify-between gap-4">
                  <button
                    type="button"
                    onClick={handleMonthCompleted}
                    className="bg-green-500 text-white font-bold px-4 py-2 rounded-lg hover:bg-green-600 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                  >
                    Month Completed
                  </button>

                  <button
                    type="submit"
                    className="bg-blue-500 text-white font-bold px-4 py-2 rounded-lg hover:bg-blue-600 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
                    disabled={isSubmitting} // Button is disabled during submission
                  >
                    Add Hours
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
