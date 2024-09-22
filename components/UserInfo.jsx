"use client";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function UserInfo() {
  const { data: session, status } = useSession();
  const [userHours, setUserHours] = useState(null);
  const router = useRouter();

  const fetchUserHours = async (useremail) => {
    try {
      console.log("Fetching hours for:", useremail);

      const response = await fetch(`${window.location.origin}/api/trackhours?email=${encodeURIComponent(useremail)}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching user hours:", error);
    }
  };

  useEffect(() => {
    if (status === "authenticated" && session?.user?.email) {
      handleFetchUserHours(session.user.email);
    }
  }, [session, status]);

  const handleFetchUserHours = async (email) => {
    if (email) {
      const data = await fetchUserHours(email);
      if (data && data.trackhours) {
        console.log("Fetched data:", data.trackhours);
        setUserHours(data.trackhours); // Store the trackhours object
      }
    }
  };

  // Place the formatDate function here, before it's used in the JSX
  const formatDate = (dateString) => {
    if (!dateString) return "Loading...";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US"); // Format as MM/DD/YYYY
  };

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
    <div className="grid place-items-center min-h-screen bg-gray-100 bg-cover bg-center bg-no-repeat" style={{backgroundImage: "url('https://source.unsplash.com/random')"}}>  {/* Added background image */}
      <div className="container mx-auto max-w-md shadow-lg p-8 bg-white rounded-lg flex flex-col gap-4 my-6">
        <h2 className="text-2xl font-bold text-gray-800 text-center">User Information</h2>
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-700">Hi {session?.user?.name},</h3>
          
        </div>
        <div>
          Email: <span className="font-bold text-gray-700">{session?.user?.email}</span>
        </div>

        {/* Render the individual fields from the userHours object */}
        <div>
          Total Hours: <span className="font-bold text-gray-700">{userHours?.hours ?? "Loading..."}</span>
        </div>
        <div>
          Last Entry Date: <span className="font-bold text-gray-700">{formatDate(userHours?.lastentry)}</span>
        </div>
        <div>
          Last Month Hours: <span className="font-bold text-gray-700">{userHours?.lastmonthhours ?? "Loading..."}</span>
        </div>
        <div className="flex justify-center">  {/* Added margin-top for spacing */}
        <button
            onClick={handleOpenPopup}
            className="bg-blue-500 text-white rounded-md font-bold px-1 py-1 mt-2"
          >
            Enter Hours
          </button>
        </div>
        <div className="flex justify-center">  {/* Added margin-top for spacing */}
        <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="bg-red-500 text-white font-bold py-0.5 px-8 rounded-md mt-0"
          
          >
            Log Out
          </button>
        </div>

        {isPopupOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
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
          </div>
        )}
      </div>
    </div>
  );
}