import { Link, useLocation, useNavigate } from "react-router-dom"
import {
  Home,
  Users,
  Calendar,
  FileText,
  Folder,
  HelpCircle,
  LogOut,

  ClipboardCheck,
  BadgeDollarSign

} from "lucide-react"
import { useState } from "react"
import { useProfile } from "../context/ProfileContext"
import LogoutSplash from "../pages/LogoutSplash"

export default function Sidebar() {
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const { profile } = useProfile()
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {

  setLoggingOut(true)

  try {

    await fetch("http://127.0.0.1:8000/api/logout/", {
      method: "POST",
      credentials: "include"
    })

  } catch (err) {

    console.error(err)

  }

  localStorage.removeItem("isAuthenticated")

  setTimeout(() => {

    navigate("/login")

  }, 1800)

}

  const handleImageChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append("sidebar_image", file)

    try {
      await fetch("[127.0.0.1](http://127.0.0.1:8000/api/profile/sidebar-image/)", {
        method: "POST",
        body: formData,
        credentials: "include"
      })

      window.location.href = window.location.pathname
    } catch (err) {
      console.error(err)
    }
  }

  const menu = [
    { name: "Dashboard", icon: <Home size={18} />, path: "/" },
    { name: "Members", icon: <Users size={18} />, path: "/members" },
    { name: "Events", icon: <Calendar size={18} />, path: "/events" },
    { name: "Files", icon: <Folder size={18} />, path: "/files" },
    { name: "Masterlist", icon: <FileText size={18} />, path: "/masterlist" },
    {
  name: "Attendance Upload",
  icon: <ClipboardCheck size={18} />,
  path: "/attendance"
},

{
  name: "Membership",
  icon: <BadgeDollarSign size={18} />,
  path: "/membership"
}
  ]

  if (loggingOut) {
  return <LogoutSplash />
}

  return (
    <>
      {/* MOBILE BUTTON */}
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden fixed top-4 left-4 z-50 bg-[#3C0008] text-white px-3 py-2 rounded"
      >
        ☰
      </button>

      {/* SIDEBAR */}
      <div
        className={`
          fixed top-0 z-40
          ${open ? "left-0" : "-left-72"}
          md:left-0
          w-72 h-screen
          bg-[#F5F5F5]
          text-gray-700
          px-6 py-6
          flex flex-col
          overflow-y-auto
          transition-all duration-300
          shadow-[4px_0_20px_rgba(0,0,0,0.1)]
        `}
      >
        {/* TOP */}
        <div>
          {/* LOGO */}
          <div className="flex flex-col items-center mb-10">
            <div className="relative w-20 h-20">
              <img
                src={
                  profile?.sidebar_image
                    ? profile.sidebar_image + "?t=" + new Date().getTime()
                    : "/logo.png"
                }
                alt="Logo"
                className="w-full h-full object-contain rounded-full"
              />

              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>

            <p className="mt-4 font-bold text-[#3C0008] text-sm text-center">
              ITS Organization
            </p>

            <p className="text-xs text-gray-400 text-center">
              Officer Portal
            </p>
          </div>
        </div>

        {/* MIDDLE */}
        <div className="flex-1 flex flex-col justify-between">
          {/* MENU */}
          <div className="space-y-4 text-sm">
            {menu.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-full transition ${
                  location.pathname === item.path
                    ? "bg-white text-[#3C0008] font-semibold shadow relative"
                    : "text-gray-500 hover:text-[#3C0008]"
                }`}
              >
                {item.icon}
                {item.name}

                {location.pathname === item.path && (
                  <span className="absolute right-0 w-2 h-8 bg-[#3C0008] rounded-l-full"></span>
                )}
              </Link>
            ))}
          </div>

          {/* FOOTER */}
          <div className="border-t pt-6 mt-6 space-y-4 text-sm text-gray-400">
            <Link
              to="/support"
              className="flex items-center gap-2 hover:text-[#3C0008] cursor-pointer transition"
            >
              <HelpCircle size={16} />
              Support
            </Link>

            <div
              onClick={handleLogout}
              className="flex items-center gap-2 hover:text-[#3C0008] cursor-pointer transition"
            >
              <LogOut size={16} />
              Sign Out
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
