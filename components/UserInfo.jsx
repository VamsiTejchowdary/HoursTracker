"use client";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ClockIcon, LogoutIcon } from "@heroicons/react/solid";
import Image from "next/image";

export default function UserInfo() {
  const { data: session, status } = useSession();
  const [userInfo, setUserInfo] = useState(null);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClockedIn, setIsClockedIn] = useState(null);
  const [isClockedOut, setIsClockedOut] = useState(null);
  const email = session?.user?.email;
  const [userDailyHourRecord, setUserDailyHourRecord] = useState(null);
  const now = new Date();

  // Memoized function using useCallback to prevent unnecessary re-renders
  const handleFetchUserHours = useCallback(async (email) => {
    try {
      const trackHoursData = await fetchTrackHours(email);
      if (trackHoursData && trackHoursData.trackhours) {
        setUserInfo(trackHoursData.trackhours);
      }
    } catch (error) {
      console.error("Error fetching user hours:", error);
    }
    try {
      const now = new Date();
      const localDate = new Date(
        now.getTime() - now.getTimezoneOffset() * 60000
      );
      const formattedDate = localDate.toISOString().slice(0, 10);
      const getDailyHourRecord = await fetchDailyHourRecord(
        email,
        formattedDate
      );
      if (getDailyHourRecord && getDailyHourRecord.dailyHourRecord) {
        setUserDailyHourRecord(getDailyHourRecord.dailyHourRecord);
        //console.log(getDailyHourRecord.dailyHourRecord);
        if (getDailyHourRecord.dailyHourRecord.isClockedIn) {
          setIsClockedIn(true);
        } else {
          setIsClockedOut(true);
        }
      }
    } catch (error) {
      console.error("Error updating user clockin deatils:", error);
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

  const handleHoursWorked = async (event) => {
    event.preventDefault();

    setIsSubmitting(true);

    const hours = parseFloat(userInfo?.hours) + parseFloat(newHours);
    const lastentry = new Date().toISOString();
    const lastmonthhours = parseFloat(userInfo?.lastmonthhours);
    const email = session?.user?.email;

    try {
      await updateTrackHours(email, lastentry, hours, lastmonthhours);
      setHours("");
      toast.success("Hours added successfully!");

      setTimeout(() => {
        window.location.reload();
      }, 5000);
    } catch (error) {
      toast.error("Failed to add hours.");
    }
  };

  const handleMonthCompleted = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const hours = parseFloat(0);
    const lastentry = userInfo?.lastentry;
    const lastmonthhours = parseFloat(userInfo?.hours);
    //const email = session?.user?.email;

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

  const handleSignOut = () => {
    signOut({
      redirect: false,
    }).then(() => {
      router.push("/login");
    });
  };
  const handleClockIn = async (e) => {
    const now = new Date();
    const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    const formattedDate = localDate.toISOString().slice(0, 10);
    const email = session?.user?.email;
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");

    const exactTime = `${hours}:${minutes}`;

    try {
      const trackhours = await fetch("/api/dailyhoursrecord", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          date: formattedDate,
          clockIn: exactTime,
          isClockedIn: true,
          isClockedOut: false,
        }),
      });

      if (!trackhours.ok) {
        throw new Error("Failed to clock in!");
      }
      const getDailyHourRecord = await fetchDailyHourRecord(
        email,
        formattedDate
      );

      //const data = await getDailyHourRecord.json();

      setUserDailyHourRecord(getDailyHourRecord.dailyHourRecord);

      setIsClockedIn(true);
      setIsClockedOut(false);
      toast.success("Clocked In Successfully!!!");
    } catch (error) {
      console.error("Error while clocking in:", error);
      toast.error("Failed to clock in.");
    }
  };

  const handleClockOut = async (e) => {
    const email = session?.user?.email;
    const { todayRecordHours, exactTime, formattedDate } =
      await calculateTodayRecordHours(email);
    await updateDailyHoursRecord(
      email,
      formattedDate,
      exactTime,
      todayRecordHours
    );

    setIsClockedIn(false);
    setIsClockedOut(true);
    toast.success("Clocked Out Successfully!!!");

    const hours = parseFloat(userInfo?.hours) + parseFloat(todayRecordHours);
    const lastentry = new Date().toISOString();
    const lastmonthhours = parseFloat(userInfo?.lastmonthhours);

    try {
      await updateTrackHours(email, lastentry, hours, lastmonthhours);
      setHours("");
      toast.success("Hours added successfully!");

      setTimeout(() => {
        window.location.reload();
      }, 5000);
    } catch (error) {
      toast.error("Failed to add hours.");
    }
  };

  function getTimeDifferenceInHours(startTime, endTime) {
    // Convert times to Date objects
    const [startHours, startMinutes] = startTime.split(":").map(Number);
    const [endHours, endMinutes] = endTime.split(":").map(Number);

    const start = new Date(0, 0, 0, startHours, startMinutes);
    const end = new Date(0, 0, 0, endHours, endMinutes);

    // Calculate the difference in milliseconds
    let diff = end - start;

    // Convert milliseconds to minutes and then to hours (in decimal)
    const hoursDifference = diff / (1000 * 60 * 60);
    return hoursDifference;
  }

  async function fetchDailyHourRecord(email, formattedDate) {
    try {
      const response = await fetch(
        `${
          window.location.origin
        }/api/dailyhoursrecord?email=${encodeURIComponent(
          email
        )}&date=${encodeURIComponent(formattedDate)}`,
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
      return data;
    } catch (error) {
      console.error("Error fetching daily hour record:", error);
      return null;
    }
  }
  async function fetchTrackHours(email) {
    try {
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
      return data;
    } catch (error) {
      console.error("Error fetching user hours:", error);
      return null;
    }
  }
  async function updateTrackHours(email, lastentry, hours, lastmonthhours) {
    try {
      const response = await fetch("/api/trackhours", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, lastentry, hours, lastmonthhours }),
      });

      if (!response.ok) {
        throw new Error("Failed to update hours");
      }

      return response;
    } catch (error) {
      console.error("Error updating hours:", error);
      throw error;
    }
  }
  async function calculateTodayRecordHours(email) {
    const now = new Date();
    const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    const formattedDate = localDate.toISOString().slice(0, 10);
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const exactTime = `${hours}:${minutes}`;

    const getDailyHourRecord = await fetchDailyHourRecord(email, formattedDate);

    const todayRecordHours = getTimeDifferenceInHours(
      getDailyHourRecord.dailyHourRecord.clockIn,
      exactTime
    );

    return { todayRecordHours, exactTime, formattedDate };
  }
  async function updateDailyHoursRecord(
    email,
    formattedDate,
    exactTime,
    todayRecordHours
  ) {
    try {
      console.log(formattedDate, exactTime, todayRecordHours);
      const trackhours = await fetch("/api/dailyhoursrecord", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          date: formattedDate,
          isClockedIn: false,
          clockOut: exactTime,
          isClockedOut: true,
          totalDayHours: todayRecordHours,
        }),
      });

      if (!trackhours.ok) {
        throw new Error("Failed to clock out!");
      }
    } catch (error) {
      console.error("Error clocking out:", error);
      throw error;
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 bg-fixed bg-cover">
      <ToastContainer
        className="fixed top-4 right-4 z-50" // Position the ToastContainer
      >
        {/* Optionally, customize toast styles inside this container */}
      </ToastContainer>

      <div className="container mx-auto max-w-lg shadow-xl p-10 bg-gradient-to-br from-blue-100 to-purple-200 rounded-lg flex flex-col gap-8 my-8 backdrop-blur-lg">
        <h2 className="text-4xl font-bold text-gray-800 text-center">
          User Information
        </h2>

        <div className="flex items-center justify-center gap-4">
          <div className="text-lg text-gray-800">
            Hi <span className="font-bold">{session?.user?.name}</span>,
          </div>
        </div>

        <div className="text-lg text-gray-800">
          User Name: <span className="font-bold">{session?.user?.email}</span>
        </div>

        <div className="text-lg text-gray-800">
          Today Clocked In:{" "}
          <span className="font-bold">
            {userDailyHourRecord?.clockIn ?? "Clock In!!!!"}
          </span>
        </div>

        <div className="text-lg text-gray-800">
          Total Hours:{" "}
          <span className="font-bold">{userInfo?.hours ?? "Loading..."}</span>
        </div>

        <div className="text-lg text-gray-800">
          Last Entry Date:{" "}
          <span className="font-bold">{formatDate(userInfo?.lastentry)}</span>
        </div>

        <div className="text-lg text-gray-800">
          Last Month Hours:{" "}
          <span className="font-bold">
            {userInfo?.lastmonthhours ?? "Loading..."}
          </span>
        </div>

        <div className="flex justify-center space-x-4 mt-4">
          {/* Conditionally render Clock In button */}
          {!isClockedIn && (
            <button
              onClick={handleClockIn}
              className={`bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-3 rounded-lg transition-all duration-200 ease-in-out shadow-lg transform hover:scale-105`}
            >
              Clock In
            </button>
          )}

          {/* Conditionally render Clock Out button */}
          {isClockedIn && (
            <button
              onClick={handleClockOut}
              className={`${
                isClockedOut
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-red-500 hover:bg-red-600"
              } text-white font-bold px-6 py-3 rounded-lg transition-all duration-200 ease-in-out shadow-lg transform hover:scale-105 disabled:opacity-50`}
              disabled={isClockedOut}
            >
              Clock Out
            </button>
          )}
        </div>

        <div className="flex justify-center space-x-4">
          <button
            onClick={handleOpenPopup}
            className="bg-blue-600 text-white font-bold px-6 py-2 rounded-lg hover:bg-blue-700 transition-all"
          >
            Enter Hours
          </button>

          <button
            onClick={handleSignOut}
            className="bg-red-600 text-white font-bold px-6 py-2 rounded-lg hover:bg-red-700 transition-all"
          >
            Log Off
          </button>
        </div>

        {isPopupOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Enter Hours</h3>
                <button
                  onClick={handleClosePopup}
                  className="text-red-500 text-2xl"
                >
                  &#10005; {/* Close (X) button */}
                </button>
              </div>

              <form
                onSubmit={handleHoursWorked}
                className="flex flex-col gap-4"
              >
                <div>
                  <label className="block text-gray-700 mb-2">
                    Hours Worked
                  </label>
                  <input
                    type="number"
                    value={newHours}
                    onChange={(e) => setHours(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-300"
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
                    disabled={isSubmitting}
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
