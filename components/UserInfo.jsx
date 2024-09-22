"use client";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function UserInfo() {
  const { data: session, status } = useSession();
  const [userHours, setUserHours] = useState(null);

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

  return (
    <div className="grid place-items-center h-screen">
      <div className="shadow-lg p-8 bg-zinc-300/10 flex flex-col gap-2 my-6">
        <div>
           <span className="font-bold">Hi {session?.user?.name},</span>
        </div>
        <div>
          Email: <span className="font-bold">{session?.user?.email}</span>
        </div>

        {/* Render the individual fields from the userHours object */}
        <div>
          Total Hours: <span className="font-bold">{userHours?.hours ?? "Loading..."}</span>
        </div>
        <div>
          Last Entry Date: <span className="font-bold">{formatDate(userHours?.lastentry)}</span>
        </div>
        <div>
          Last Month Hours: <span className="font-bold">{userHours?.lastmonthhours ?? "Loading..."}</span>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="bg-red-500 text-white font-bold px-6 py-2 mt-3"
        >
          Log Out
        </button>
      </div>
    </div>
  );
}