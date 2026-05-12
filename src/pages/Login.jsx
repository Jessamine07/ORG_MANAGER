import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { User, Lock } from "lucide-react"
import { useEffect } from "react"
import { Medal, Globe, Users } from "lucide-react"
import { Eye, EyeOff } from "lucide-react"

export default function Login({ darkMode }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate()
  const [remember, setRemember] = useState(false)
  const [showForgotModal, setShowForgotModal] = useState(false)
const [fpUsername, setFpUsername] = useState("")
const [fpPassword, setFpPassword] = useState("")
const [fpConfirmPassword, setFpConfirmPassword] = useState("")
const [showPassword, setShowPassword] = useState(false)
const [showConfirmPassword, setShowConfirmPassword] = useState(false)

const [alertModal, setAlertModal] = useState({
  show: false,
  message: "",
  type: "success" // or "error"
})

  const handleLogin = async () => {

     await getCSRF() // 🔥 FIRST CALL THIS

    const res = await fetch("http://127.0.0.1:8000/api/login/", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  credentials: "include",
  body: JSON.stringify({
    username,
    password
  })
})

    const data = await res.json()

    if (data.success) {

  // 🔥 ONLY ADD THIS BLOCK (no changes to existing logic)
  if (remember) {
    localStorage.setItem("rememberedUsername", username)
  } else {

  localStorage.removeItem("rememberedUsername")

  setUsername("")

}
  localStorage.removeItem("isAuthenticated")
localStorage.removeItem("username")

localStorage.setItem("isAuthenticated", "true")
localStorage.setItem("username", username)  // 🔥 save current user
  window.location.href = "/"
} else {
      setAlertModal({
  show: true,
  message: "Invalid login",
  type: "error"
})
    }
  }

  const getCSRF = async () => {
  await fetch("http://127.0.0.1:8000/api/csrf/", {
    credentials: "include"
  })
}

const handleForgotPassword = async () => {
  const usernameInput = prompt("Enter your username:")
  if (!usernameInput) return

  const newPass = prompt("Enter your new password:")
  if (!newPass) return

  await getCSRF()

  const res = await fetch("http://127.0.0.1:8000/api/reset-password/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: JSON.stringify({
      username: usernameInput,
      new_password: newPass
    })
  })

  const data = await res.json()

  if (data.success) {
    setAlertModal({
  show: true,
  message: "Password reset successful!",
  type: "success"
})
  } else {
    alert(data.error)
  }
}

const handleResetPassword = async () => {
  if (!fpUsername || !fpPassword || !fpConfirmPassword) {
    alert("Please fill all fields")
    return
  }

  if (fpPassword !== fpConfirmPassword) {
    alert("Passwords do not match")
    return
  }

  await getCSRF()

  const res = await fetch("http://127.0.0.1:8000/api/reset-password/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: JSON.stringify({
      username: fpUsername,
      new_password: fpPassword
    })
  })

  const data = await res.json()

  if (data.success) {
    setAlertModal({
  show: true,
  message: "Password reset successful!",
  type: "success"
})
    setShowForgotModal(false)
    setFpUsername("")
    setFpPassword("")
  } else {
    setAlertModal({
  show: true,
  message: data.error,
  type: "error"
})
  }
}

useEffect(() => {

  const savedUser =
    localStorage.getItem("rememberedUsername")

  if (savedUser) {

    setUsername(savedUser)
    setRemember(true)

  } else {

    setUsername("")
    setRemember(false)

  }

}, [])

  return (
    <div className="min-h-screen bg-[#EDEDED] dark-mode:bg-[#0B0F19] flex items-center justify-center">

  {/* MAIN CONTAINER */}
  <div className="w-full max-w-5xl min-h-[520px] bg-[#F9F9F9] dark-mode:bg-[#111827] rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.1)] grid grid-cols-2 overflow-hidden">

    {/* LEFT PANEL */}
    <div className="p-12 flex flex-col justify-between">

      <div>
        <div
  className="
    w-16 h-16
    rounded-full
    overflow-hidden

    bg-white
    dark-mode:bg-[#1F2937]

    shadow-[0_8px_25px_rgba(0,0,0,0.08)]

    flex items-center justify-center

    mb-6
  "
>

  <img
    src="/logosvg.png"
    alt="ITSConnect Logo"

    className="
      w-full
      h-full

      object-contain

      p-1
    "
  />

</div>

        <h1 className="text-2xl font-bold text-[#3C0008] !text-[#3C0008] leading-tight">
          ITS connect: <br /> Leadership Portal
        </h1>

        <p className="text-gray-500 !text-gray-500 text-sm mt-4 leading-relaxed max-w-xs">
          Secure access for authorized student officers.
        </p>
      </div>

      <div>
        <p className="text-xs text-gray-400 !text-gray-400 mb-3">VISIT US</p>
       <div className="flex gap-4">

  <div className="w-10 h-10 bg-white dark-mode:bg-[#1F2937] rounded-2xl flex items-center justify-center shadow-[0_10px_25px_rgba(0,0,0,0.12)]

hover:shadow-[0_14px_30px_rgba(60,0,8,0.18)]

transition-all
duration-300">
   <Medal
  size={16}
  className={
    darkMode
      ? "text-white"
      : "text-[#3C0008]"
  }
/>
  </div>

  <div className="w-10 h-10 bg-white dark-mode:bg-[#1F2937] rounded-2xl flex items-center justify-center shadow-[0_10px_25px_rgba(0,0,0,0.12)]

hover:shadow-[0_14px_30px_rgba(60,0,8,0.18)]

transition-all
duration-300">
   <Globe
  size={16}
  className={
    darkMode
      ? "text-white"
      : "text-[#3C0008]"
  }
/>
  </div>

  <div className="w-10 h-10 bg-white dark-mode:bg-[#1F2937] rounded-2xl flex items-center justify-center shadow-[0_10px_25px_rgba(0,0,0,0.12)]

hover:shadow-[0_14px_30px_rgba(60,0,8,0.18)]

transition-all
duration-300">
    <Users
  size={16}
  className={
    darkMode
      ? "text-white"
      : "text-[#3C0008]"
  }
/>
  </div>

</div>
      </div>

    </div>

    {/* RIGHT PANEL */}
<div
  className="
    bg-white
    dark-mode:bg-[#020617]

    p-12

    flex flex-col justify-center

    rounded-l-2xl

    shadow-[-35px_0_70px_rgba(0,0,0,0.12)]

dark-mode:shadow-[-35px_0_80px_rgba(0,0,0,0.65)]

    relative
    z-10
  "
>

  <form
    onSubmit={(e) => {
      e.preventDefault()
      handleLogin()
    }}
  >

      <h2 className="text-xl font-semibold mb-1 dark-mode:text-white">Welcome Back</h2>

      <p className="text-xs text-gray-400 dark-mode:text-gray-500 mb-6 tracking-wide">
        ENTER YOUR CREDENTIALS TO CONTINUE
      </p>

      {/* USERNAME */}
      <div className="flex items-center border border-gray-300 dark-mode:border-gray-700 rounded-lg px-3 py-2 mb-4">
        <User size={16} className="text-gray-400 mr-2" />
        <input
  type="text"
  name="username"
 autoComplete="off"
  placeholder="Username"
  value={username}
  onChange={(e) => setUsername(e.target.value)}

  className="
w-full
bg-transparent

text-sm

text-black
dark-mode:text-white

placeholder-gray-400

border-0
border-none

outline-none
focus:outline-none

ring-0
focus:ring-0

shadow-none
focus:shadow-none

appearance-none

!border-none
!ring-0
!outline-none
"
/>
        
      </div>

      {/* PASSWORD */}
      <div className="flex items-center border border-gray-300 dark-mode:border-gray-700 rounded-lg px-3 py-2 mb-4">
        <Lock size={16} className="text-gray-400 mr-2" />
        <input
  type="password"
  name="password"
  placeholder="••••••••"
  autoComplete="off"
  onChange={(e) => setPassword(e.target.value)}

  className="
w-full
bg-transparent

text-sm

text-black
dark-mode:text-white

placeholder-gray-400

border-0
border-none

outline-none
focus:outline-none

ring-0
focus:ring-0

shadow-none
focus:shadow-none

appearance-none

!border-none
!ring-0
!outline-none
"
/>
      </div>

      {/* OPTIONS */}
      <div className="flex justify-between items-center text-xs mb-6">
        <label className="flex items-center gap-2 text-gray-500 dark-mode:text-gray-400">
          <input
  type="checkbox"
  checked={remember}
 onChange={(e) => {

  setRemember(e.target.checked)

  if (!e.target.checked) {

    localStorage.removeItem("rememberedUsername")

    setUsername("")

  }

}}
/>
          Remember me
        </label>

        <span
  onClick={() => setShowForgotModal(true)}
  className="text-[#3C0008] dark-mode:text-white cursor-pointer hover:underline"
>
  Forgot password?
</span>
      </div>

      {/* LOGIN BUTTON */}
      <button
        type="submit"
        className="
          w-full py-2 rounded-lg text-white text-sm font-medium
          bg-[#3C0008]
          shadow-[0_6px_15px_rgba(60,0,8,0.4)]
          hover:shadow-[0_8px_20px_rgba(60,0,8,0.6)]
          transition duration-300
        "
      >
        Log In
      </button>


<p
  onClick={() => navigate("/signup")}
  className="text-xs text-[#3C0008] dark-mode:text-white text-center font-semibold cursor-pointer hover:underline"
>

</p>
 </form>
    </div>

  </div>
  {showForgotModal && (
  <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">

    <div className="bg-[#F9F9F9] dark-mode:dark-mode:bg-[#182848] w-[350px] p-6 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] text-center">

      {/* ICON */}
      <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-white dark-mode:bg-[#1F2937] flex items-center justify-center shadow">
        <span className="text-[#3C0008] text-xl">↻</span>
      </div>

      {/* TITLE */}
      <h2 className="text-xl font-bold text-[#3C0008] dark-mode:text-white mb-2">
        Forgot Password
      </h2>

      {/* SUBTEXT */}
      <p className="text-xs text-gray-500 dark-mode:text-gray-400 mb-6 leading-relaxed">
        Enter your username and set a new password to reset your account.
      </p>

      {/* INPUT */}
      <div className="mb-3">
        <input
          type="text"
          placeholder="Username"
          value={fpUsername}
          onChange={(e) => setFpUsername(e.target.value)}
          className="w-full px-4 py-2 rounded-full bg-gray-200 dark-mode:bg-[#020617] text-sm outline-none"
        />
      </div>

      <div className="mb-3 relative">

  <input
    type={showPassword ? "text" : "password"}
    placeholder="New Password"
    value={fpPassword}
    onChange={(e) => setFpPassword(e.target.value)}
    className="w-full px-4 py-2 pr-10 rounded-full bg-gray-200 dark-mode:bg-[#020617] text-sm outline-none"
  />

  {/* 👁 ICON */}
  <div
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
  >
    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
  </div>

</div>

      <div className="mb-5 relative">

  <input
    type={showConfirmPassword ? "text" : "password"}
    placeholder="Confirm Password"
    value={fpConfirmPassword}
    onChange={(e) => setFpConfirmPassword(e.target.value)}
    className="w-full px-4 py-2 pr-10 rounded-full bg-gray-200 dark-mode:bg-[#020617] text-sm outline-none"
  />

  {/* 👁 ICON */}
  <div
    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
  >
    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
  </div>

</div>

      {/* BUTTON */}
      <button
        onClick={handleResetPassword}
        className="
          w-full py-2 rounded-full text-white text-sm font-semibold
          bg-[#3C0008]
          shadow-[0_6px_15px_rgba(122,0,0,0.4)]
          hover:shadow-[0_8px_20px_rgba(122,0,0,0.6)]
          transition duration-300
        "
      >
        Reset Password
      </button>

      {/* BACK */}
      <p
        onClick={() => setShowForgotModal(false)}
        className="mt-5 text-xs text-gray-500 dark-mode:text-gray-400 cursor-pointer hover:underline"
      >
        ← Back to login
      </p>

    </div>
  </div>
)}

{alertModal.show && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

    <div className="
bg-white

w-[400px]
p-6
rounded-2xl

shadow-[0_10px_30px_rgba(0,0,0,0.8)]

transition duration-300
">

      {/* TITLE */}
      <p className="text-sm text-gray-500 mb-2">
        System Message
      </p>

      {/* MESSAGE */}
      <h2 className={`text-lg font-semibold mb-6 ${
        alertModal.type === "error"
          ? "text-red-600"
          : "text-gray-800"
      }`}>
        {alertModal.message}
      </h2>

      {/* BUTTON */}
      <div className="flex justify-end">
        <button
          onClick={() => setAlertModal({ ...alertModal, show: false })}
          className="
            px-6 py-2 rounded-full text-white text-sm font-medium
            bg-[#3C0008]
            shadow-[0_6px_15px_rgba(60,0,8,0.4)]
            hover:shadow-[0_8px_20px_rgba(60,0,8,0.6)]
            transition
          "
        >
          OK
        </button>
      </div>

    </div>

  </div>
)}
</div>
  )
}