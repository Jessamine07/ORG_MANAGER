import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { User, Lock, Mail } from "lucide-react"
import { Medal, Globe, Users } from "lucide-react"


export default function Signup() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate()


  const handleSignup = async () => {
    const res = await fetch("https://org-manager-o05u.onrender.com/api/register/", {
    method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  credentials: "include", // 🔥 ADD THIS
  body: JSON.stringify({
    username,
    email,
    password
  })
})

    const data = await res.json()

if (data.success) {
  localStorage.removeItem("isAuthenticated")
localStorage.removeItem("username") // 🔥 clear old user (Jessa)

localStorage.setItem("isAuthenticated", "true")
localStorage.setItem("username", username)  // 🔥 save current user
  alert("Account created!\nYour system code: " + data.code)
  navigate("/") // or dashboard
} else {
  alert(data.error || "Signup failed")
}
  }

  return (
    <div className="min-h-screen bg-[#EDEDED] dark-mode:bg-[#0B0F19] flex items-center justify-center">

      <div className="w-full max-w-5xl min-h-[520px] bg-[#F9F9F9] dark-mode:bg-[#111827] rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.1)] grid grid-cols-2 overflow-hidden">

        {/* LEFT PANEL (SAME AS LOGIN — DO NOT TOUCH COLORS) */}
        <div className="p-12 flex flex-col justify-between">

          <div>
            <div className="w-14 h-14 bg-white dark-mode:bg-[#1F2937] rounded-full shadow flex items-center justify-center mb-6">
              <span className="text-[#3C0008] text-xl">🏛</span>
            </div>

            <h1 className="text-2xl font-bold text-[#3C0008] !text-[#3C0008] leading-tight">
              StudentLink: <br /> Leadership Portal
            </h1>

            <p className="text-gray-500 !text-gray-500 text-sm mt-4 leading-relaxed max-w-xs">
              Secure access for authorized student officers and administrative personnel.
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-400 !text-gray-400 mb-3">VISIT US</p>
            <div className="flex gap-4">

  <div className="w-10 h-10 bg-white dark-mode:bg-[#1F2937] rounded-2xl flex items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.08)]">
    <Medal size={16} className="text-[#3C0008]" />
  </div>

  <div className="w-10 h-10 bg-white dark-mode:bg-[#1F2937] rounded-2xl flex items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.08)]">
    <Globe size={16} className="text-[#3C0008]" />
  </div>

  <div className="w-10 h-10 bg-white dark-mode:bg-[#1F2937] rounded-2xl flex items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.08)]">
    <Users size={16} className="text-[#3C0008]" />
  </div>

</div>
          </div>

        </div>

        {/* RIGHT PANEL */}
        <div className="bg-white dark-mode:bg-[#020617] p-12 flex flex-col justify-center rounded-l-2xl">

          <h2 className="text-xl font-semibold mb-1 dark-mode:text-white">
            Create Account
          </h2>

          <p className="text-xs text-gray-400 dark-mode:text-gray-500 mb-6 tracking-wide">
            REGISTER TO ACCESS THE PORTAL
          </p>

          {/* USERNAME */}
          <div className="flex items-center border border-gray-300 dark-mode:border-gray-700 rounded-lg px-3 py-2 mb-4">
            <User size={16} className="text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Username"
              className="outline-none text-sm w-full bg-transparent dark-mode:text-white"
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          {/* EMAIL */}
          <div className="flex items-center border border-gray-300 dark-mode:border-gray-700 rounded-lg px-3 py-2 mb-4">
            <Mail size={16} className="text-gray-400 mr-2" />
            <input
              type="email"
              placeholder="Email"
              className="outline-none text-sm w-full bg-transparent dark-mode:text-white"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* PASSWORD */}
          <div className="flex items-center border border-gray-300 dark-mode:border-gray-700 rounded-lg px-3 py-2 mb-4">
            <Lock size={16} className="text-gray-400 mr-2" />
            <input
              type="password"
              placeholder="Password"
              className="outline-none text-sm w-full bg-transparent dark-mode:text-white"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* BUTTON */}
          <button
            onClick={handleSignup}
            className="
              w-full py-2 rounded-lg text-white text-sm font-medium
              bg-[#3C0008]
              shadow-[0_6px_15px_rgba(60,0,8,0.4)]
              hover:shadow-[0_8px_20px_rgba(60,0,8,0.6)]
              transition duration-300
            "
          >
            Sign Up
          </button>

          {/* BACK TO LOGIN */}
          <p className="text-xs text-gray-400 dark-mode:text-gray-500 text-center mt-6">
            Already have an account?
          </p>

          <p
            onClick={() => navigate("/login")}
            className="text-xs text-[#3C0008] dark-mode:text-white text-center font-semibold cursor-pointer hover:underline"
          >
            LOGIN HERE
          </p>

        </div>

      </div>
    </div>
  )
}