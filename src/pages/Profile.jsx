import {
  Shield,
  Bell,
  Users,
  Eye,
  EyeOff
} from "lucide-react"
import { useState, useEffect } from "react"
import { useProfile } from "../context/ProfileContext"



export default function Profile({ darkMode }) {


  const [localProfile, setLocalProfile] = useState({
  name: "",
  email: "",
  phone: "",
  position: "",
  school_year: "",
  profile_image: null
})

const { setProfile } = useProfile()


const [loading, setLoading] = useState(true)
const [showPasswordModal, setShowPasswordModal] = useState(false)

const [passwordData, setPasswordData] = useState({
  current_password: "",
  new_password: "",
  confirm_password: ""
})

const [showPasswords, setShowPasswords] = useState({
  current: false,
  new: false,
  confirm: false
})

const [showSuccessModal, setShowSuccessModal] =
  useState(false)

const [successMessage, setSuccessMessage] =
  useState("")

useEffect(() => {
  fetch(
  "http://127.0.0.1:8000/api/profile/",
  {
    credentials: "include"
  }
)
    .then(res => res.json())
    .then(data => {
      if (!data.error) {
        setLocalProfile(data)
      }
      setLoading(false)
    })
}, [])

const handleChange = (e) => {
  setLocalProfile({
    ...localProfile,
    [e.target.name]: e.target.value
  })
}

const handleImage = (e) => {
  setLocalProfile({
    ...localProfile,
    profile_image: e.target.files[0]
  })
}

const handleSubmit = async () => {
  try {
    const formData = new FormData()

    formData.append("name", localProfile.name)
    formData.append("email", localProfile.email)
    formData.append("phone", localProfile.phone)
    formData.append("position", localProfile.position)
    formData.append("school_year", localProfile.school_year)

    if (localProfile.profile_image instanceof File) {
      formData.append("profile_image", localProfile.profile_image)
    }

    console.log("SENDING DATA...")

    const response = await fetch(
  "http://127.0.0.1:8000/api/profile/update/",
  {
    method: "POST",

    credentials: "include",

    body: formData
  }
)

    const result = await response.json()

    console.log("RESPONSE:", result)

    // 🔥 FETCH UPDATED DATA
    const res = await fetch(
  "http://127.0.0.1:8000/api/profile/",
  {
    credentials: "include"
  }
)
    const data = await res.json()

    setProfile({
  ...data,
  profile_image: data.profile_image
})

setLocalProfile({
  ...data,
  profile_image: data.profile_image
})

    alert("Profile saved successfully!") // ✅ feedback

  } catch (error) {
    console.error("ERROR:", error)
    alert("Something went wrong!")
  }
}

const handlePasswordChange = async () => {

  if (
    passwordData.new_password !==
    passwordData.confirm_password
  ) {

    setSuccessMessage(
      "Passwords do not match."
    )

    setShowSuccessModal(true)

    return
  }

  try {

    const response = await fetch(
      "http://127.0.0.1:8000/api/change-password/",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({

          username:
            localStorage.getItem("username"),

          current_password:
            passwordData.current_password,

          new_password:
            passwordData.new_password

        })

      }
    )

    const data = await response.json()

    if (response.ok) {

      setSuccessMessage(
        "Password changed successfully!"
      )

      setShowSuccessModal(true)

      setShowPasswordModal(false)

      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: ""
      })

    } else {

      setSuccessMessage(
        data.error ||
        "Failed to change password."
      )

      setShowSuccessModal(true)

    }

  } catch (err) {

    console.error(err)

    setSuccessMessage(
      "Something went wrong."
    )

    setShowSuccessModal(true)

  }

}

  return (
    <div className="p-8 min-h-screen bg-white dark-mode:bg-[#0B0F19] transition-colors duration-300">

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#3C0008] dark-mode:text-white">
          Account Settings
        </h1>
        <p className="text-gray-400 text-sm">
          Manage your institutional identity and security preferences.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6">

        {/* LEFT */}
        <div className="col-span-2 space-y-6">

          {/* PROFILE CARD */}
         <div className="
bg-white dark-mode:bg-[#111827]
p-6 rounded-3xl

border border-gray-200 dark-mode:border-white/5

shadow-[0_10px_30px_rgba(0,0,0,0.2)]
dark-mode:shadow-[0_15px_35px_rgba(0,0,0,0.6)]

transition duration-300
">

            <h2 className="font-semibold mb-6 flex items-center gap-2 text-[#3C0008] dark-mode:text-white">
              👤 Profile Information
            </h2>

            <div className="flex gap-6 items-start">

              {/* AVATAR */}
              <div className="relative">
{localProfile.profile_image ? (
  <img
    src={
      typeof localProfile.profile_image === "string"
        ? localProfile.profile_image
        : URL.createObjectURL(localProfile.profile_image)
    }
    className="w-28 h-28 rounded-2xl object-cover"
  />
) : (
  <div className="w-28 h-28 bg-gray-300 rounded-2xl flex items-center justify-center">
    No Image
  </div>
)}

  <input
    type="file"
    onChange={handleImage}
    className="absolute inset-0 opacity-0 cursor-pointer"
  />
</div>


              {/* INPUTS */}
              <div className="flex-1 grid grid-cols-2 gap-4 text-sm w-full">

             <input
  name="name"
  value={localProfile.name}
  onChange={handleChange}
  placeholder="Full Name"
  className="
    w-full h-10
    bg-white
    border-2 border-[#3C0008]
    px-4
    rounded-full
    text-black
    block
  "
/>

 <input
  name="phone"
  value={localProfile.phone}
  onChange={handleChange}
  placeholder="Contact No."
  className="
    w-full h-10
    bg-white
    border-2 border-[#3C0008]
    px-4
    rounded-full
    text-black
    block
  "
/>


 <input
  name="position"
  value={localProfile.position}
  onChange={handleChange}
  placeholder="Position"
  className="
    w-full h-10
    bg-white
    border-2 border-[#3C0008]
    px-4
    rounded-full
    text-black
    block
  "
/>


 <input
  name="school_year"
  value={localProfile.school_year}
  onChange={handleChange}
  placeholder="School Year"
  className="
    w-full h-10
    bg-white
    border-2 border-[#3C0008]
    px-4
    rounded-full
    text-black
    block
  "
/>
              </div>

            </div>

            {/* BIO */}
            <textarea
              defaultValue="Committed to fostering a transparent and inclusive campus environment..."
              className="
mt-6 w-full
bg-gray-200 border border-gray-300
dark-mode:bg-[#020617] dark-mode:border-[#374151]
p-4 rounded-2xl
outline-none text-sm
text-black dark-mode:text-white

focus:ring-2 focus:ring-[#7F1D1D]/30
"
            />

            <button
  onClick={handleSubmit}
  className="
    mt-6
    bg-[#3C0008] text-white
    px-6 py-2 rounded-full text-sm font-semibold

    shadow-[0_10px_25px_rgba(60,0,8,0.4)]
    transition-all duration-300 ease-in-out

    hover:bg-[#5C0006]
    hover:shadow-[0_15px_35px_rgba(60,0,8,0.6)]
    hover:-translate-y-1 hover:scale-[1.02]

    active:scale-95
  "
>
  Save Profile Changes
</button>
          </div>

          {/* ORGANIZATIONS */}
          <div className="
bg-white dark-mode:bg-[#111827]
p-6 rounded-3xl

border border-gray-200 dark-mode:border-white/5

shadow-[0_10px_30px_rgba(0,0,0,0.2)]
dark-mode:shadow-[0_15px_35px_rgba(0,0,0,0.6)]

transition duration-300
">

            <h2 className="font-semibold mb-4 text-[#3C0008] dark-mode:text-white">
              Assigned Organizations
            </h2>

            <div className="flex gap-4">

              <div
  className={`
flex items-center gap-3

px-4 py-3
rounded-full
text-sm

border
backdrop-blur-sm

transition-all duration-300

${
  darkMode
    ? `
      bg-white/5
      border-white/20
      hover:bg-white/10
      hover:border-white/40
    `
    : `
      bg-[#3C0008]/5
      border-[#3C0008]/30
      hover:bg-[#3C0008]/10
      hover:border-[#3C0008]/50
    `
}
`}
>
                <div className="
  w-8 h-8 
  bg-[#3C0008]/10 
  flex items-center justify-center 
  rounded-full
">
  <Users size={16} className="text-[#3C0008]" />
</div>
                <div>
                  <p className="font-semibold text-black dark-mode:text-white">
                    Student Council
                  </p>
                  <p className="text-xs text-gray-400 dark-mode:text-gray-300">
                    Admin Permissions • Active
                  </p>
                </div>
              </div>

               <div
  className={`
flex items-center gap-3

px-4 py-3
rounded-full
text-sm

border
backdrop-blur-sm

transition-all duration-300

${
  darkMode
    ? `
      bg-white/5
      border-white/20
      hover:bg-white/10
      hover:border-white/40
    `
    : `
      bg-[#3C0008]/5
      border-[#3C0008]/30
      hover:bg-[#3C0008]/10
      hover:border-[#3C0008]/50
    `
}
`}
>
                <div className="
  w-8 h-8 
  bg-[#3C0008]/10 
  flex items-center justify-center 
  rounded-full
">
  <Shield size={16} className="text-[#3C0008]" />
</div>
                <div>
                  <p className="font-semibold text-black dark-mode:text-white">
                    Heritage Society
                  </p>
                  <p className="text-xs text-gray-400 dark-mode:text-gray-300">
                    Editor Permissions • Active
                  </p>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* RIGHT */}
        <div className="space-y-6">

          {/* SECURITY */}
        <div className="
bg-white dark-mode:bg-[#111827]
p-6 rounded-3xl

border border-gray-200 dark-mode:border-white/5

shadow-[0_10px_30px_rgba(0,0,0,0.2)]
dark-mode:shadow-[0_15px_35px_rgba(0,0,0,0.6)]

transition duration-300
">

            <h2 className="font-semibold mb-4 flex items-center gap-2 text-[#3C0008] dark-mode:text-white">
              <Shield size={16}/> Security
            </h2>

            <button
  onClick={() => setShowPasswordModal(true)}
 className="
w-full

bg-gray-200
dark-mode:bg-[#1F2937]

px-4 py-3
rounded-full

text-sm

flex justify-between items-center

text-black
dark-mode:text-white

transition duration-300
">
              Change Password
              <span>{">"}</span>
            </button>

            <div className="mt-4 flex justify-between items-center text-sm">
              <p className="text-black dark-mode:text-white">Two-Factor Auth</p>
              <input type="checkbox" className="accent-[#7F1D1D]" />
            </div>

            <div className="mt-6 text-xs text-gray-400 dark-mode:text-gray-300">
              <p>ACTIVE SESSIONS</p>
              <p className="mt-1">
                Windows • Philippines
                <span className="text-green-500 ml-2">Current</span>
              </p>
              <p className="text-red-500 mt-1 cursor-pointer">
                Sign out of all sessions
              </p>
            </div>

          </div>

          {/* ALERTS */}
          <div className="
bg-white dark-mode:bg-[#111827]
p-6 rounded-3xl

border border-gray-200 dark-mode:border-white/5

shadow-[0_10px_30px_rgba(0,0,0,0.2)]
dark-mode:shadow-[0_15px_35px_rgba(0,0,0,0.6)]

transition duration-300
">

            <h2 className="font-semibold mb-4 flex items-center gap-2 text-[#3C0008] dark-mode:text-white">
              <Bell size={16}/> Alerts
            </h2>

            <div className="space-y-4 text-sm">

              <div className="flex justify-between">
                <p className="text-black dark-mode:text-white">Email Notifications</p>
                <input type="checkbox" className="accent-[#7F1D1D]" />
              </div>

              <div className="flex justify-between">
                <p className="text-black dark-mode:text-white">Push Notifications</p>
                <input type="checkbox" defaultChecked className="accent-[#7F1D1D]" />
              </div>

              <div className="flex justify-between">
                <p className="text-black dark-mode:text-white">Event Updates</p>
                <input type="checkbox" defaultChecked className="accent-[#7F1D1D]" />
              </div>

            </div>

          </div>

        </div>

      </div>

      {showPasswordModal && (

  <div
    className="
      fixed inset-0
      bg-black/40
      flex items-center justify-center
      z-50
    "

    onClick={() => setShowPasswordModal(false)}
  >

    <div
  className={`
    
    w-[420px]
    rounded-3xl
    p-8
    transition-all duration-300

    ${
      darkMode
        ? `
          bg-[#0F172A]
          shadow-[0_25px_70px_rgba(0,0,0,0.8)]
        `
        : `
          bg-white
          border border-gray-200
          shadow-[0_20px_50px_rgba(0,0,0,0.15)]
        `
    }

  `}
  onClick={(e) => e.stopPropagation()}
>

     <h2
  className={`
    text-2xl font-bold mb-6

    ${
      darkMode
        ? "text-white"
        : "text-[#3C0008]"
    }
  `}
>
        Change Password
      </h2>

      <div className="space-y-4">

        <div className="relative">

  <input
    type={showPasswords.current ? "text" : "password"}

    placeholder="Current Password"

    value={passwordData.current_password}

    onChange={(e) =>
      setPasswordData({
        ...passwordData,
        current_password: e.target.value
      })
    }

    className={`
  w-full
  px-4
  py-3

  rounded-2xl

  pr-12

  outline-none

  transition-all
  duration-300

  ${
    darkMode
      ? `
        bg-[#1E293B]
        border border-[#334155]

        text-white
        placeholder:text-gray-400
      `
      : `
        bg-[#F8FAFC]
        border border-gray-300

        text-black
        placeholder:text-gray-500
      `
  }

  focus:ring-2
  focus:ring-[#3C0008]/30
`}
  />

  <button
    type="button"

    onClick={() =>
      setShowPasswords({
        ...showPasswords,
        current: !showPasswords.current
      })
    }

    className="
      absolute right-4 top-1/2
      -translate-y-1/2
      text-gray-400
    "
  >
    {showPasswords.current
      ? <EyeOff size={18}/>
      : <Eye size={18}/>
    }
  </button>

</div>

       <div className="relative">

  <input
    type={showPasswords.new ? "text" : "password"}

    placeholder="New Password"

    value={passwordData.new_password}

    onChange={(e) =>
      setPasswordData({
        ...passwordData,
        new_password: e.target.value
      })
    }

    className={`
  w-full
  px-4
  py-3

  rounded-2xl

  pr-12

  outline-none

  transition-all
  duration-300

  ${
    darkMode
      ? `
        bg-[#1E293B]
        border border-[#334155]

        text-white
        placeholder:text-gray-400
      `
      : `
        bg-[#F8FAFC]
        border border-gray-300

        text-black
        placeholder:text-gray-500
      `
  }

  focus:ring-2
  focus:ring-[#3C0008]/30
`}
  />

  <button
    type="button"

    onClick={() =>
      setShowPasswords({
        ...showPasswords,
        new: !showPasswords.new
      })
    }

    className="
      absolute right-4 top-1/2
      -translate-y-1/2
      text-gray-400
    "
  >
    {showPasswords.new
      ? <EyeOff size={18}/>
      : <Eye size={18}/>
    }
  </button>

</div>

        <div className="relative">

  <input
    type={showPasswords.confirm ? "text" : "password"}

    placeholder="Confirm Password"

    value={passwordData.confirm_password}

    onChange={(e) =>
      setPasswordData({
        ...passwordData,
        confirm_password: e.target.value
      })
    }

  className={`
  w-full
  px-4
  py-3

  rounded-2xl

  pr-12

  outline-none

  transition-all
  duration-300

  ${
    darkMode
      ? `
        bg-[#1E293B]
        border border-[#334155]

        text-white
        placeholder:text-gray-400
      `
      : `
        bg-[#F8FAFC]
        border border-gray-300

        text-black
        placeholder:text-gray-500
      `
  }

  focus:ring-2
  focus:ring-[#3C0008]/30
`}
  />

  <button
    type="button"

    onClick={() =>
      setShowPasswords({
        ...showPasswords,
        confirm: !showPasswords.confirm
      })
    }

    className="
      absolute right-4 top-1/2
      -translate-y-1/2
      text-gray-400
    "
  >
    {showPasswords.confirm
      ? <EyeOff size={18}/>
      : <Eye size={18}/>
    }
  </button>

</div>

      </div>

      <div className="flex justify-center gap-4 mt-8">

       <button
  onClick={() => setShowPasswordModal(false)}

  className={`
px-6 py-2 rounded-xl
text-sm font-medium
transition

${
  darkMode
    ? `
      bg-[#1F2937]
      text-white
    `
    : `
      bg-gray-200
      text-[#3C0008]
    `
}
`}
>
  Cancel
</button>

        <button
  onClick={handlePasswordChange}

  className="
px-6 py-2 rounded-xl
text-sm font-medium
shadow-md
transition

bg-[#3C0008]
hover:bg-[#5B0000]
text-white
"
>
  Save
</button>

      </div>

    </div>

  </div>

)}

{showSuccessModal && (

  <div
    className="
      fixed inset-0
      bg-black/40
      flex items-center justify-center
      z-[999]
      animate-fadeIn
    "
  >

    <div
      className="
        bg-white
        dark-mode:bg-[#111827]

        w-[360px]

        rounded-3xl
        p-7

        shadow-[0_25px_60px_rgba(0,0,0,0.35)]

        animate-scaleIn
      "
    >

      {/* ICON */}
      <div
        className="
          w-16 h-16
          rounded-full

          bg-[#3C0008]/10

          flex items-center justify-center

          mx-auto mb-5
        "
      >

        <span className="text-3xl text-[#3C0008]">
          ✓
        </span>

      </div>

      {/* TITLE */}
      <h2
        className="
          text-2xl font-bold
          text-center

          text-[#3C0008]
          dark-mode:text-white

          mb-3
        "
      >
        Notification
      </h2>

      {/* MESSAGE */}
      <p
        className="
          text-center
          text-gray-500
          dark-mode:text-gray-400

          mb-6
        "
      >
        {successMessage}
      </p>

      {/* BUTTON */}
      <button
        onClick={() =>
          setShowSuccessModal(false)
        }

        className="
          w-full py-3

          rounded-2xl

          bg-[#3C0008]
          text-white

          font-semibold

          transition-all duration-300

          hover:bg-[#5C0006]
          hover:scale-[1.02]

          active:scale-95
        "
      >
        OK
      </button>

    </div>

  </div>

)}

    </div>

  )
}