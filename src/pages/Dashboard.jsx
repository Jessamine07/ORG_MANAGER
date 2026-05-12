import { motion } from "framer-motion"
import { Search, Bell, Settings } from "lucide-react"
import { Calendar, Users, Folder, FileText } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Moon, Sun } from "lucide-react"
import { useProfile } from "../context/ProfileContext"


export default function Dashboard({ darkMode, setDarkMode }) {
  
  
  const [notifications, setNotifications] = useState([])
  const clearNotifications = async () => {
  try {
    await fetch("http://127.0.0.1:8000/api/notifications/clear/", {
      method: "POST",
      credentials: "include"
    })
    setNotifications([])
  } catch (err) {
    console.error(err)
  }
}
  const [events, setEvents] = useState([])
const [showNotif, setShowNotif] = useState(false)
const [showProfile, setShowProfile] = useState(false)
const profileRef = useRef(null)
const navigate = useNavigate()
const { profile, setProfile } = useProfile()
const [tasks, setTasks] = useState([])
const [taskInput, setTaskInput] = useState("")
const [search, setSearch] = useState("")
const [searchResults, setSearchResults] = useState([])
const [members, setMembers] = useState([])
const [files, setFiles] = useState([])
const [showSuggestions, setShowSuggestions] = useState(false)
const [fileSearch, setFileSearch] = useState("")


const handleRequest = async (id, action) => {
  try {
    await fetch("http://127.0.0.1:8000/api/requests/handle/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({ id, action })
    })

    fetchRequests() // refresh list
  } catch (err) {
    console.error(err)
  }
}

const fetchFiles = async () => {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/files/", {
      credentials: "include"
    })

    const data = await res.json()
    setFiles(data)

  } catch (err) {
    console.error(err)
  }
}

const fetchRequests = async () => {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/requests/", {
      credentials: "include"
    })
    const data = await res.json()
    setRequests(data)
  } catch (err) {
    console.error(err)
  }
}



const addTask = async () => {
  if (!taskInput.trim()) return

  await fetch("http://127.0.0.1:8000/api/tasks/add/", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: taskInput })
  })

  setTaskInput("")
  fetchTasks()
}

const removeTask = async (id) => {
  await fetch("http://127.0.0.1:8000/api/tasks/delete/", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id })
  })

  fetchTasks()
}

const fetchNotifications = async () => {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/notifications/", {
      credentials: "include"
    })
    const data = await res.json()
    setNotifications(data)
  } catch (err) {
    console.error(err)
  }
}

const [stats, setStats] = useState({
  total_members: 0,
  active_events: 0,
  attendance_rate: 0
})

const fetchStats = async () => {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/dashboard/", {
      credentials: "include"
    })
    const data = await res.json()
    setStats(data)
  } catch (err) {
    console.error(err)
  }
}

const fetchEvents = async () => {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/events/", {
  credentials: "include"
})
    const data = await res.json()
    setEvents(data)
  } catch (err) {
    console.error("EVENT FETCH ERROR:", err)
  }
}

const fetchMembers = async () => {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/members/", {
  credentials: "include"
})
    const data = await res.json()
    setMembers(data)
  } catch (err) {
    console.error(err)
  }
}

const fetchTasks = async () => {
  const res = await fetch("http://127.0.0.1:8000/api/tasks/", {
  credentials: "include"
})
  const data = await res.json()
  setTasks(data)
}

const filteredFiles = files.filter(file =>
  file.name.toLowerCase().includes(fileSearch.toLowerCase())
)

useEffect(() => {
  fetchNotifications()
  fetchStats()
  fetchEvents()
  fetchMembers()
  fetchTasks()
  fetchFiles()

}, [])

useEffect(() => {
  if (search.trim() === "") {
    setSearchResults([])
    return
  }

  const results = [
    ...members
      .filter(m => m.name.toLowerCase().includes(search.toLowerCase()))
      .map(m => ({ type: "member", name: m.name })),

    ...events
      .filter(e => e.title.toLowerCase().includes(search.toLowerCase()))
      .map(e => ({ type: "event", name: e.title }))
  ]

  setSearchResults(results)
}, [search, members, events])



useEffect(() => {
  const handleClickOutside = (event) => {
    if (profileRef.current && !profileRef.current.contains(event.target)) {
      setShowProfile(false)
    }
  }

  document.addEventListener("mousedown", handleClickOutside)

  return () => {
    document.removeEventListener("mousedown", handleClickOutside)
  }
}, [])

const getIcon = (type) => {
  switch (type) {
    case "event":
      return <Calendar size={18} color="#3C0008" />
    case "member":
      return <Users size={18} color="#3C0008" />
    case "file":
      return <Folder size={18} color="#3C0008" />
    case "attendance":
      return <FileText size={18} color="#3C0008" />
    default:
      return <Calendar size={18} color="#3C0008" />
  }
}

const activities = [

  // EVENTS
  ...events.map(event => ({
    type: "event",
    title: `Officer created event ${event.title}`,
    date: event.date
  })),

  // MEMBERS
  ...members.map(member => ({
    type: "member",
    title: `New member added: ${member.name}`,
    date: member.created_at || new Date()
  }))

].sort((a, b) => new Date(b.date) - new Date(a.date))


  return (
    <div className="flex-1 px-10 pt-4 pb-6 min-h-screen">

      {/* TOP BAR */}
      <div className="flex justify-between items-center mb-10">

        <h1 className="text-lg font-bold tracking-widest text-[#3C0008]">
          OFFICER PORTAL
        </h1>

        <div className="flex items-center gap-6">

         <div className="
relative
flex items-center px-4 py-2 rounded-full
border border-gray-400
bg-transparent
">
            <Search size={16}/>
 <input
  type="text"
  placeholder="Search file..."
  value={fileSearch}

  onChange={(e) => {
    setFileSearch(e.target.value)
    setShowSuggestions(true)
  }}

  onFocus={() => setShowSuggestions(true)}

  onBlur={() =>
    setTimeout(() => setShowSuggestions(false), 200)
  }

  autoComplete="off"

  className="
    ml-2
    text-sm
    w-40

    bg-transparent
    !bg-transparent

    border-0
    !border-0

    outline-none
    focus:outline-none

    ring-0
    focus:ring-0

    caret-[#3C0008] dark:caret-white

    shadow-none
    focus:shadow-none

    appearance-none

    text-black
    placeholder:text-gray-400
  "
/>

  {/* SUGGESTIONS */}
  {showSuggestions && fileSearch && (

    <div className={`
  absolute top-full left-0 mt-2
  w-72
  rounded-2xl
  shadow-xl
  overflow-hidden
  z-50
  border

  ${
    darkMode
      ? "bg-[#111827] border-white/10"
      : "bg-white border-gray-200"
  }
`}>

      {filteredFiles.length > 0 ? (

        filteredFiles.slice(0, 5).map((file, index) => (

          <div
            key={index}

            onClick={() => navigate('/files')}

           className={`
  px-4 py-3
  cursor-pointer
  transition duration-200

  ${
    darkMode
      ? "hover:bg-[#1F2937]"
      : "hover:bg-gray-200 hover:text-[#3C0008]"
  }
`}
          >

            <p className={`text-sm ${darkMode ? "text-white" : "text-black"}`}>
              {file.name}
            </p>

          </div>

        ))

      ) : (

        <div className="px-4 py-3 text-sm text-gray-400">
          No files found
        </div>

      )}

    </div>

  )}

          </div>

          <div className="relative" ref={profileRef}>

  {/* 🔔 BELL */}
  <Bell
    className="cursor-pointer"
    onClick={() => {
  setShowNotif(!showNotif)
  fetchRequests() // 🔥 load join requests
}}
  />

  {/* 🔻 DROPDOWN */}
  {showNotif && (
    <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl p-4 z-50">

      <div className="flex justify-between items-center mb-3">
  <h3 className="font-semibold text-sm text-[#3C0008]">
    Notifications
  </h3>

  <button
    onClick={clearNotifications}
    className="text-xs text-[#3C0008] hover:underline"
  >
    Clear all
  </button>
</div>

      <div className="space-y-3 max-h-60 overflow-y-auto">

        {notifications.length === 0 ? (
          <p className="text-sm text-gray-400 text-center">
            No notifications
          </p>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className="p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
            >
              <p className="text-sm">{notif.message}</p>
              <p className="text-xs text-gray-400">{notif.time}</p>
            </div>
          ))
        )}

      </div>

    </div>
  )}

</div>
          <button
  onClick={() => setDarkMode(!darkMode)}
  className="p-2 rounded-full hover:bg-gray-200 transition"
>
  {darkMode ? (
    <Sun size={18} className="text-yellow-400" />
  ) : (
    <Moon size={18} />
  )}
</button>

    <div className="relative" ref={profileRef}>

  {/* PROFILE BUTTON */}
  <div
    onClick={() => setShowProfile(!showProfile)}
    className="flex items-center gap-3 cursor-pointer"
  >
    <div className="text-right text-xs leading-tight">
      <p className="font-semibold dark-mode:text-white">
  {profile?.name || "Officer"}
</p>
      <p className="opacity-60 text-xs">
        ADMIN ACCESS
      </p>
    </div>

   {profile?.profile_image ? (
  <img
  src={
    profile?.profile_image
      ? profile.profile_image + "?t=" + new Date().getTime()
      : "/default-avatar.png"
  }
  className="w-9 h-9 rounded-full object-cover"
/>
) : (
  <div className="w-9 h-9 bg-gray-300 rounded-full"></div>
)}
  </div>

  {/* DROPDOWN */}
  {showProfile && (
    <div
  className={`
    absolute right-0 mt-3 w-52
    rounded-xl shadow-xl p-2 z-50

    ${
      darkMode
        ? "bg-[#111827]"
        : "bg-white border border-gray-200"
    }
  `}
>

  {/* ✅ USER INFO */}
  <div className="px-3 py-2 border-b mb-2">
    <p className={`text-sm font-semibold ${darkMode ? "text-white" : "text-black"}`}>
  {profile?.name || "Loading..."}
</p>
    <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
      officer@email.com
    </p>
  </div>

 <button
  onClick={() => {
    setShowProfile(false) // close dropdown
    navigate("/profile")
  }}
className={`
w-full text-left
px-3 py-2
text-sm
transition duration-200

${
  darkMode
    ? `
      text-white
      hover:bg-[#243041]
    `
    : `
      text-[#3C0008]
      hover:bg-gray-200
      hover:text-[#3C0008]
    `
}
`}
>
  Profile Settings
</button>

</div>
  )}

</div>

        </div>
      </div>

      {/* TITLE + BUTTONS (SAME ROW) */}
      <div className="flex justify-between items-center mb-8">

        <div>
          <p className="text-xs text-gray-400 tracking-widest mb-1">
            OVERVIEW & ANALYTICS
          </p>
          <h2 className="text-3xl font-bold text-[#3C0008]">
            Dashboard
          </h2>
        </div>


      </div>

      {/* CARDS */}
      <div className="grid grid-cols-3 gap-8 mb-8">

        {/* MEMBERS */}
        <motion.div whileHover={{ scale: 1.02 }}
           className="
bg-gradient-to-br from-[#1F2937] to-[#111827]
text-white
p-6 rounded-2xl
border border-white/5
shadow-[0_10px_30px_rgba(0,0,0,0.5)]
hover:shadow-[0_15px_40px_rgba(0,0,0,0.7)]
hover:-translate-y-1
transition duration-300
"
        >
          <p className="text-gray-400 text-xs mb-2">TOTAL MEMBERS</p>
          <h2 className="text-4xl font-bold text-[#3C0008]">{stats.total_members}</h2>
          <p className="text-green-600 text-xs mt-2">+12% this month</p>
        </motion.div>

        {/* EVENTS */}
        <motion.div whileHover={{ scale: 1.02 }}
 className="
bg-gradient-to-br from-[#1F2937] to-[#111827]
text-white
p-6 rounded-2xl
border border-white/5
shadow-[0_10px_30px_rgba(0,0,0,0.5)]
hover:shadow-[0_15px_40px_rgba(0,0,0,0.7)]
hover:-translate-y-1
transition duration-300
"
        >
          <p className="text-gray-400 text-xs mb-2">ACTIVE EVENTS</p>
          <h2 className="text-4xl font-bold text-[#3C0008]">{stats.active_events}</h2>
          <p className="text-gray-400 text-xs mt-2">Planned for Q3</p>
        </motion.div>

        {/* ATTENDANCE */}
        <motion.div whileHover={{ scale: 1.02 }}
          className="
bg-gradient-to-br from-[#1F2937] to-[#111827]
text-white
p-6 rounded-2xl
border border-white/5
shadow-[0_10px_30px_rgba(0,0,0,0.5)]
hover:shadow-[0_15px_40px_rgba(0,0,0,0.7)]
hover:-translate-y-1
transition duration-300
"
        >
          <p className="text-gray-400 text-xs mb-2">ATTENDANCE RATE</p>
          <h2 className="text-4xl font-bold text-[#3C0008]">{stats.attendance_rate}</h2>

          <div className="w-full bg-gray-200 h-2 rounded mt-4">
            <div
  className="bg-[#3C0008] h-2 rounded"
  style={{ width: `${stats.attendance_rate}%` }}
></div>
          </div>
        </motion.div>

      </div>

      {/* LOWER GRID */}
      <div className="grid grid-cols-3 gap-8">

        {/* LEFT */}
       <div className="
col-span-2
bg-gradient-to-br from-[#1F2937] to-[#111827]
text-white
p-6 rounded-2xl
border border-white/5
shadow-[0_10px_30px_rgba(0,0,0,0.5)]
hover:shadow-[0_15px_40px_rgba(0,0,0,0.7)]
transition duration-300 no-accent
">
          <h3 className="font-bold text-[#3C0008] mb-5">
            RECENT ACTIVITY
          </h3>

          <div className="space-y-6 text-sm">

  {activities.length === 0 ? (

  <p className="text-gray-400">
    No recent activity
  </p>

) : (

  activities.slice(0, 6).map((activity, index) => (

    <div key={index} className="flex gap-3">

      <div className="
        w-10 h-10
        bg-gray-200
        rounded-full
        flex items-center justify-center
        shadow
      ">
        {getIcon(activity.type)}
      </div>

      <div>

        <p className="text-sm">
          {activity.title}
        </p>

        <p className="text-xs text-gray-400">
          {new Date(activity.date).toDateString()}
        </p>

      </div>

    </div>

  ))

)}

</div>
        </div>

        {/* RIGHT */}
        <div className="flex flex-col gap-8">

          {/* UPCOMING EVENTS */}
          <div className="bg-[#3C0008] text-white p-6 rounded-2xl shadow-md">
            <h3 className="font-bold mb-5">UPCOMING EVENTS</h3>

            <div className="space-y-5">

              {events.length === 0 ? (
  <p className="text-sm opacity-70 text-center">
    No events available
  </p>
) : (
  [...events]
  .filter(event => new Date(event.date) >= new Date())
  .sort((a, b) => new Date(a.date) - new Date(b.date))
  .slice(0, 3)
  .map((event) => {
    const date = new Date(event.date)

    return (
      <div key={event.id} className="flex gap-3 items-center">
        <div className="bg-white/20 w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold">
          {date.toLocaleString("en-US", { month: "short" }).toUpperCase()}<br/>
          {date.getDate()}
        </div>
        <div>
          <p className="font-bold">{event.title}</p>
          <p className="text-xs opacity-70">
            {event.location || "No location"} · {event.start_time}
          </p>
        </div>
      </div>
    )
  })
)}
            </div>

           <button
  onClick={() => navigate("/events")}
  className="
    mt-6 w-full
    bg-white text-[#3C0008]
    py-2 rounded-full text-sm font-semibold

    transition duration-300 ease-in-out
    hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02]
    active:scale-95

    cursor-pointer
  "
>
  VIEW FULL CALENDAR
</button>
          </div>

          {/* PENDING */}
          <div className="
bg-gradient-to-br from-[#1F2937] to-[#111827] no-accent
text-white
p-5 rounded-2xl
border border-white/5
shadow-[0_10px_25px_rgba(0,0,0,0.5)]
">
            <h3 className="text-xs font-bold text-gray-400 mb-5 tracking-widest">
              TO-DO LIST
            </h3>
<div className="space-y-4 text-sm">

  {/* INPUT */}
  <div className="flex gap-2">
    <input
      type="text"
      placeholder="Add task..."
      className="flex-1 px-3 py-2 rounded 
bg-white text-black 
dark-mode:bg-[#020617] dark-mode:text-white 
text-sm border border-gray-300"
      value={taskInput}
      onChange={(e) => setTaskInput(e.target.value)}
    />
    <button
      onClick={addTask}
      className="bg-[#3C0008] px-3 rounded text-xs !text-white 
  hover:opacity-90 transition"
    >
      ADD
    </button>
  </div>

  {/* TASK LIST */}
 {tasks.length === 0 ? (
  <p className="text-gray-400 text-xs">No tasks yet</p>
) : (
  tasks.map((task) => (
    <div key={task.id} className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
        {task.title}
      </div>

      <button
        onClick={() => removeTask(task.id)}
        className="text-gray-400 text-xs"
      >
        ✕
      </button>
    </div>
  ))
)}

</div>
          </div>

        </div>

      </div>
    </div>
  )
}