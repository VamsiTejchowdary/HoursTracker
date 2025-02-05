"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res.error) {
        setError("Invalid Credentials");
        return;
      }

      router.replace("dashboard");
      const now = new Date();
      const localDate = new Date(
        now.getTime() - now.getTimezoneOffset() * 60000
      );
      const formattedDate = localDate.toISOString().slice(0, 10);
      //console.log(formattedDate);
      
      const dailyRecordExist = await fetch("api/dailyHourRecordExists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email,date:formattedDate }),
      });
      console.log(dailyRecordExist);
      const { exists } = await dailyRecordExist.json();
      //console.log(exists);
      if(!exists){
        
        const res = await fetch("api/dailyhoursrecord", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email,date: formattedDate }),
        });
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="grid place-items-center h-screen">
      <div className="shadow-lg p-5 rounded-lg border-t-4 border-green-400">
        <h1 className="text-xl font-bold my-4">Login</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            onChange={(e) => setEmail(e.target.value)}
            type="text"
            placeholder="User Name"
          />
          <input
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
          />
          <button className="bg-green-600 text-white font-bold cursor-pointer px-6 py-2">
            Login
          </button>
          {error && (
            <div className="bg-red-500 text-white w-fit text-sm py-1 px-3 rounded-md mt-2">
              {error}
            </div>
          )}

          <Link className="text-sm mt-3 text-right" href={"/register"}>
            Dont have an account? <span className="underline">Register</span>
          </Link>
        </form>
      </div>
    </div>
  );
}