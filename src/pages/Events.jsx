import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Clock,
  MoreVertical
} from "lucide-react"
import { useEffect, useState } from "react"

export default function Events({ darkMode }) {

  const today = new Date()

  const [currentDate, setCurrentDate] = useState(today)
  const [events, setEvents] = useState([])
  const [selectedDate, setSelectedDate] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [showAll, setShowAll] = useState(false)
const [editingEvent, setEditingEvent] = useState(null)
const [showDeleteModal, setShowDeleteModal] = useState(false)
const [selectedEventId, setSelectedEventId] = useState(null)
const [selectedEvent, setSelectedEvent] = useState(null)
const [activeEventMenu, setActiveEventMenu] = useState(null)


  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    start_time: "",
    end_time: "",
    location: ""
  })

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const calendarDays = []

  // empty slots
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null)
  }

  // real days
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(d)
  }

  const fetchEvents = async () => {
    try {
      const res = await fetch("https://org-manager-o05u.onrender.com/api/events/")
      const data = await res.json()
      setEvents(data)
    } catch (err) {
      console.error(err)
    }
  }

const normalizedToday = new Date(today)

normalizedToday.setHours(0, 0, 0, 0)

const upcomingEvents = events
  .filter(e => {

    const eventDate = new Date(e.date)

    eventDate.setHours(0, 0, 0, 0)

    return eventDate >= normalizedToday
  })

  .sort((a, b) => new Date(a.date) - new Date(b.date))

 const todayEvent = upcomingEvents.find(event => {

  const eventDate = new Date(event.date)

  return (
    eventDate.toDateString() === today.toDateString()
  )

})

const nextEvent = todayEvent || upcomingEvents[0]

  
 
  const displayedEvents = showAll ? upcomingEvents : upcomingEvents.slice(0, 3)

  useEffect(() => {
    fetchEvents()
  }, [])


const handleDelete = async () => {
  console.log("Deleting ID:", selectedEventId)

  await fetch("https://org-manager-o05u.onrender.com/api/events/delete/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: selectedEventId })
  })

  setShowDeleteModal(false)
  setSelectedEventId(null)
  fetchEvents()
}

  return (
    <div className="p-8 min-h-screen">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">

  {/* HEADER */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <p className="text-xs text-gray-400 mb-1">ORGANIZATION SCHEDULE</p>
          <h1 className="text-3xl font-bold text-[#3C0008]">Events Calendar</h1>
          <p className="text-gray-400 text-sm mt-2">Manage student upcoming and incoming events.</p>
        </div>
      </div>

  {/* RIGHT (NEW BUTTON POSITION) */}
  <button
    onClick={() => {

  setEditingEvent(null)

  setForm({
    title: "",
    description: "",
    date: "",
    start_time: "",
    end_time: "",
    location: ""
  })

  setShowModal(true)
}}
    className="
      bg-gradient-to-r from-[#3C0008] to-[#5C0010]
      text-white px-5 py-2 rounded-full text-sm font-semibold
      shadow-[0_10px_25px_rgba(60,0,8,0.5)]
      hover:scale-[1.03]
      transition
    "
  >
    + Add Event
  </button>

</div>
        

      {/* MAIN GRID */}
      <div className="grid grid-cols-3 gap-6">

        {/* LEFT CALENDAR */}
       <div
  className={`
    col-span-2
    rounded-3xl
    p-6
    no-accent
    transition duration-300

    ${
      darkMode
        ? `
          bg-gradient-to-br from-[#1F2937] to-[#111827]
          text-white
          border border-white/5
          shadow-[0_35px_90px_rgba(0,0,0,0.85)]
        `
        : `
          bg-white
          text-gray-700
          border border-gray-100
          shadow-[0_25px_70px_rgba(0,0,0,0.18)]
        `
    }
  `}
>
          {/* HEADER */}
          <div className="flex justify-between items-center mb-4">

            <h2 className="font-semibold text-lg">
              {currentDate.toLocaleString("default", { month: "long" })} {year}
            </h2>

            <div className="flex items-center gap-4 text-sm text-gray-500">
              <ChevronLeft
                className="cursor-pointer"
                onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
              />
              <span className="font-medium cursor-pointer"
                onClick={() => setCurrentDate(new Date())}
              >
                Today
              </span>
              <ChevronRight
                className="cursor-pointer"
                onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
              />
            </div>

          </div>

          {/* DAYS */}
          <div className="grid grid-cols-7 text-xs text-gray-400 mb-2">
            {["SUN","MON","TUE","WED","THU","FRI","SAT"].map(day => (
              <p key={day}>{day}</p>
            ))}
          </div>

          {/* CALENDAR */}
          <div className="grid grid-cols-7 gap-2 text-sm">

            {calendarDays.map((day, i) => (
              <div
                key={i}
                onClick={() => {
                  if (!day) return

                  const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`

                  setSelectedDate(date)
                  setEditingEvent(null)
                  setForm({
    title: "",
    description: "",
    date,
    start_time: "",
    end_time: "",
    location: ""
  })
                  setShowModal(true)
                }}

                style={
  day &&
  day === today.getDate() &&
  month === today.getMonth() &&
  year === today.getFullYear()
    ? {
        background: document.body.classList.contains("dark-mode")
          ? "#2A0A0A"
          : "#FDE2E2"
      }
    : {}
}
                className={`h-24 p-2 rounded-xl border cursor-pointer ${
 darkMode
  ? "hover:bg-[#1F2937]"
  : `
      hover:bg-[#F8FAFC]
      hover:border-[#D1D5DB]
      hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)]
    `
} ${
                  !day
                    ? "bg-transparent border-none cursor-default"
                    : "border-gray-100 dark-mode:border-gray-700"
                } ${ 
  day &&
  day === today.getDate() &&
  month === today.getMonth() &&
  year === today.getFullYear()
    ? "border-[#3C0008] border-2"
    : ""
}`}
              >
                {day && (
                  <>
                    <p
  className={`text-xs ${
    day &&
    day === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear()
      ? "bg-[#3C0008] text-white w-6 h-6 flex items-center justify-center rounded-full"
      : "text-gray-400"
  }`}
>
  {day}
</p>

                    {events
                      .filter(e => {
  if (!e.date || !day) return false

  const eventDate = new Date(e.date)

  return (
    eventDate.getDate() === day &&
    eventDate.getMonth() === month &&
    eventDate.getFullYear() === year
  )
})
                      .map(event => (
<span
  key={event.id}

  onClick={(e) => {
    e.stopPropagation()

    setEditingEvent(event.id)

    setForm({
      title: event.title || "",
      description: event.description || "",
      date: event.date || "",
      start_time: event.start_time || "",
      end_time: event.end_time || "",
      location: event.location || ""
    })

    setShowModal(true)
  }}

  className={`
    text-xs
    px-2 py-1
    rounded-full
    block mt-1
    cursor-pointer

    ${
      darkMode
        ? `
          bg-[#2A2F3A]
          text-[#DC2626]
          font-medium
        `
        : `
          bg-blue-100
          text-blue-700
        `
    }
  `}
>
  {event.title}
</span>
                    ))}
                  </>
                )}
              </div>
            ))}

          </div>

        </div>

        {/* RIGHT PANEL (UNCHANGED DESIGN) */}
        <div className="flex flex-col gap-6">

          <div className="
  bg-gradient-to-br from-[#1F2937] to-[#111827]
  text-white
  p-6 rounded-3xl
  border border-[#3C0008]/40
  shadow-[0_15px_40px_rgba(0,0,0,0.7)]
  no-accent
">
            {nextEvent ? (
  <>
    <p className="text-xs text-red-500 mb-2">
  ● {todayEvent ? "TODAY'S EVENT" : "NEXT EVENT"}
</p>

    <h3 className="font-bold text-lg mb-2">
      {nextEvent.title}
    </h3>

    <p className="text-gray-400 text-sm mb-4">
      {nextEvent.description || "No description"}
    </p>

    <div className="flex items-center gap-3 mb-3">
      <Clock size={16}/>
      <div>
        <p className="text-xs text-gray-400">TIME</p>
        <p className="text-sm font-semibold">
          {new Date(nextEvent.date).toLocaleDateString()} ·{" "}
          {new Date(`1970-01-01T${nextEvent.start_time}`).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
          })}
        </p>
      </div>
    </div>

    <div className="flex items-center gap-3 mb-4">
      <MapPin size={16}/>
      <div>
        <p className="text-xs text-gray-400">LOCATION</p>
        <p className="text-sm font-semibold">
          {nextEvent.location || "TBA"}
        </p>
      </div>
    </div>

    <button
  onClick={() => setSelectedEvent(nextEvent)}
  className="
    mt-4 w-full py-3
    rounded-full
    bg-gradient-to-r from-[#3C0008] to-[#5C0010]
    !text-white
    font-semibold
    shadow-[0_10px_25px_rgba(60,0,8,0.5)]
    transition duration-300
    hover:scale-[1.03]
    hover:shadow-[0_15px_35px_rgba(60,0,8,0.7)]
    active:scale-95
  "
>
  View Full Details
</button>
  </>
) : (
  <p className="text-gray-400 text-sm">No upcoming events</p>
)}
          </div>

          <div>
  {/* HEADER */}
  <div className="flex justify-between items-center mb-4">
    <p className="text-xs text-gray-400 tracking-widest">
      UPCOMING
    </p>
    <p
  className="text-xs text-gray-400 cursor-pointer"
  onClick={() => setShowAll(!showAll)}
>
  {showAll ? "Show Less" : "View All"}
</p>
  </div>

  {/* LIST */}
  <div className="space-y-4">

    {upcomingEvents.length === 0 ? (
      <p className="text-sm text-gray-400">No upcoming events</p>
    ) : (
      displayedEvents.map((event) => {
        const dateObj = new Date(event.date)

        const month = dateObj
          .toLocaleString("default", { month: "short" })
          .toUpperCase()

        const day = dateObj.getDate()

        return (
   <div
  key={event.id}
  style={{ overflow: "visible" }}
  className="
  relative
  overflow-visible

  bg-gradient-to-br from-[#1F2937] to-[#111827]
  text-white
  p-5 rounded-2xl
  border border-[#3C0008]/40
  shadow-[0_15px_40px_rgba(0,0,0,0.7)]
  no-accent
"
>
  <div className="flex justify-between items-start">

    {/* LEFT SIDE (your existing design) */}
    <div>
      <p className="text-xs text-gray-400 mb-1">
        {month} {day}
      </p>

      <p className="font-semibold text-sm text-white mb-1">
        {event.title}
      </p>

      <p className="text-xs text-gray-400">
        {new Date(`1970-01-01T${event.start_time}`).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit"
        })} · {event.location}
      </p>
    </div>

    {/* RIGHT SIDE (NEW BUTTONS) */}
 <div className="relative">

  {/* 3 DOT BUTTON */}
  <MoreVertical
    size={18}
    className={`
      cursor-pointer transition

      ${
        darkMode
          ? "text-gray-400 hover:text-white"
          : "text-gray-500 hover:text-[#3C0008]"
      }
    `}
    onClick={() => {
      setActiveEventMenu(
        activeEventMenu === event.id
          ? null
          : event.id
      )
    }}
  />

  {/* DROPDOWN */}
  {activeEventMenu === event.id && (
    <div
    style={{ zIndex: 99999 }}
    
      className={`
        absolute right-0 top-7
        w-32 rounded-xl overflow-hidden z-50

        ${
          darkMode
            ? `
              bg-[#1F2937]
              shadow-[0_20px_50px_rgba(0,0,0,0.7)]
            `
            : `
              bg-white
              shadow-[0_15px_40px_rgba(0,0,0,0.18)]
            `
        }
      `}
    >

      {/* EDIT */}
      <div
        onClick={() => {

          setForm({
            title: event.title || "",
            description: event.description || "",
            date: event.date || "",
            start_time: event.start_time || "",
            end_time: event.end_time || "",
            location: event.location || ""
          })

          setEditingEvent(event.id)

          setShowModal(true)

          setActiveEventMenu(null)
        }}
        className={`
          px-4 py-2 text-sm cursor-pointer transition

          ${
            darkMode
              ? `
                text-white
                hover:bg-[#374151]
              `
              : `
                text-[#3C0008]
                hover:bg-gray-200
              `
          }
        `}
      >
        Edit
      </div>

      {/* DELETE */}
      <div
        onClick={() => {
          setSelectedEventId(event.id)
          setShowDeleteModal(true)
          setActiveEventMenu(null)
        }}
        className={`
          px-4 py-2 text-sm cursor-pointer transition

          ${
            darkMode
              ? `
                text-red-400
                hover:bg-[#374151]
              `
              : `
                text-[#3C0008]
                hover:bg-gray-200
              `
          }
        `}
      >
        Delete
      </div>

    </div>
  )}

</div>

  </div>
</div>
        )
      })
    )}
    
  </div>
</div>

        </div>

        

      </div>

      {/* MODAL */}
    {showModal && (
  <div
   className="
  fixed inset-0
  bg-black/30
  flex items-center justify-center
  z-50
"
    onClick={() => setShowModal(false)}
  >

    <div
     className={`
  w-[420px]
  rounded-3xl
  p-8
  transition

  ${
    darkMode
      ? `
        bg-[#0F172A]
        shadow-[0_25px_70px_rgba(0,0,0,0.8)]
      `
      : `
        bg-white
        shadow-[0_20px_60px_rgba(0,0,0,0.25)]
      `
  }
`}
      onClick={(e) => e.stopPropagation()}
    >

      {/* TITLE */}
      <h2 className={`
text-xl font-bold mb-6 text-center

${
  darkMode
    ? "text-white"
    : "text-[#3C0008]"
}
`}>
        {editingEvent ? "Edit Event" : "Add Event"}
      </h2>

      {/* FORM */}
      <div className="space-y-4">

        <input
          placeholder="Title"
          value={form.title}
          onChange={(e)=>setForm({...form, title:e.target.value})}
          className={`
w-full
px-4 py-3
rounded-xl
outline-none
text-sm
transition

${
  darkMode
    ? `
      bg-[#0F172A]
      border border-[#374151]
      text-gray-200
      placeholder-gray-500
    `
    : `
      bg-gray-200
      border border-gray-300
      text-[#3C0008]
      placeholder-gray-500
    `
}
`}
        />

        <input
          placeholder="Description"
          value={form.description}
          onChange={(e)=>setForm({...form, description:e.target.value})}
          className={`
w-full
px-4 py-3
rounded-xl
outline-none
text-sm
transition

${
  darkMode
    ? `
      bg-[#0F172A]
      border border-[#374151]
      text-gray-200
      placeholder-gray-500
    `
    : `
      bg-gray-200
      border border-gray-300
      text-[#3C0008]
      placeholder-gray-500
    `
}
`}
        />

        <input
          type="date"
          value={form.date}
          onChange={(e)=>setForm({...form, date:e.target.value})}
         className={`
w-full
px-4 py-3
rounded-xl
outline-none
text-sm
transition

${
  darkMode
    ? `
      bg-[#0F172A]
      border border-[#374151]
      text-gray-200
      placeholder-gray-500
    `
    : `
      bg-gray-200
      border border-gray-300
      text-[#3C0008]
      placeholder-gray-500
    `
}
`}
        />

        <div className="grid grid-cols-2 gap-4">

          <input
            type="time"
            value={form.start_time}
            onChange={(e)=>setForm({...form, start_time:e.target.value})}
          className={`
w-full
px-4 py-3
rounded-xl
outline-none
text-sm
transition

${
  darkMode
    ? `
      bg-[#0F172A]
      border border-[#374151]
      text-gray-200
      placeholder-gray-500
    `
    : `
      bg-gray-200
      border border-gray-300
      text-[#3C0008]
      placeholder-gray-500
    `
}
`}
          />

          <input
            type="time"
            value={form.end_time}
            onChange={(e)=>setForm({...form, end_time:e.target.value})}
           className={`
w-full
px-4 py-3
rounded-xl
outline-none
text-sm
transition

${
  darkMode
    ? `
      bg-[#0F172A]
      border border-[#374151]
      text-gray-200
      placeholder-gray-500
    `
    : `
      bg-gray-200
      border border-gray-300
      text-[#3C0008]
      placeholder-gray-500
    `
}
`}
          />

        </div>

        <input
          placeholder="Location"
          value={form.location}
          onChange={(e)=>setForm({...form, location:e.target.value})}
         className={`
w-full
px-4 py-3
rounded-xl
outline-none
text-sm
transition

${
  darkMode
    ? `
      bg-[#0F172A]
      border border-[#374151]
      text-gray-200
      placeholder-gray-500
    `
    : `
      bg-gray-200
      border border-gray-300
      text-[#3C0008]
      placeholder-gray-500
    `
}
`}
        />

      </div>

      {/* BUTTONS */}
      <div className="flex justify-center gap-4 mt-6">

           <button
          onClick={() => setShowModal(false)}
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
          type="button"
          onClick={async () => {

            await fetch("https://org-manager-o05u.onrender.com/api/events/save/", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...form,
                id: editingEvent
              })
            })

            setShowModal(false)

            fetchEvents()

            setForm({
              title: "",
              description: "",
              date: "",
              start_time: "",
              end_time: "",
              location: ""
            })

          }}

          className="
px-6 py-2 rounded-xl
bg-[#3C0008]
hover:bg-[#5B0000]
text-white text-sm font-medium
shadow-md
transition

          "
        >
          Save
        </button>


      </div>

    </div>

  </div>
)}
      {showDeleteModal && (
  <div
    className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
    onClick={() => setShowDeleteModal(false)}
  >
   <div
className={`
  rounded-2xl
  p-8
  w-[350px]
  text-center
  transition

  ${
    darkMode
      ? `
        bg-[#0F172A]
        shadow-[0_25px_60px_rgba(0,0,0,0.8)]
      `
      : `
        bg-white
        shadow-[0_20px_50px_rgba(0,0,0,0.18)]
      `
  }
`}
  onClick={(e) => e.stopPropagation()}
>
      <h2
className={`
  text-xl
  font-bold
  mb-3

  ${
    darkMode
      ? "text-white"
      : "text-[#3C0008]"
  }
`}
>
   
        Delete Event
      </h2>

      <p
className={`
  text-[17px]
  leading-relaxed
  mb-6

  ${
    darkMode
      ? "text-gray-400"
      : "text-gray-500"
  }
`}
>
        Are you sure you want to delete this event?
      </p>

     <div className="flex justify-center gap-5">

        <button
          onClick={() => setShowDeleteModal(false)}
          className={`
px-7 py-3
rounded-xl
font-medium
transition

${
  darkMode
    ? `
      bg-[#1F2937]
      text-white
      hover:bg-[#374151]
    `
    : `
      bg-gray-200
      text-black
      hover:bg-gray-300
    `
}
`}
        >
          Cancel
        </button>

        <button
          onClick={handleDelete}
          className="
px-7 py-3
rounded-xl
font-medium
bg-[#3C0008]
hover:bg-[#5C0010]
text-white
transition
"
        >
          Delete
        </button>

      </div>
    </div>
  </div>
)}

{selectedEvent && (
  <div
    className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
    onClick={() => setSelectedEvent(null)}
  >
      <div
  className={`
    w-[420px]
    rounded-3xl
    p-8
    transition

    ${
      darkMode
        ? `
          bg-[#0F172A]
          shadow-[0_25px_70px_rgba(0,0,0,0.8)]
        `
        : `
          bg-white
          shadow-[0_20px_60px_rgba(0,0,0,0.25)]
        `
    }
  `}
      onClick={(e) => e.stopPropagation()}
    >

      {/* TITLE */}
      <h2
  className={`
    text-2xl
    font-bold
    mb-2

    ${
      darkMode
        ? "text-white"
        : "text-[#3C0008]"
    }
  `}
>
        {selectedEvent.title}
      </h2>

      {/* DESCRIPTION */}
      <p
  className={`
    mb-6
    text-sm
    leading-relaxed

    ${
      darkMode
        ? "text-gray-400"
        : "text-gray-500"
    }
  `}
>
        {selectedEvent.description || "No description available"}
      </p>

      {/* DATE */}
      <div className="mb-3">
        <p className="text-xs text-gray-400">DATE</p>
        <p className={`font-semibold ${darkMode ? "text-white" : "text-black"}`}>
          {new Date(selectedEvent.date).toLocaleDateString()}
        </p>
      </div>

      {/* TIME */}
      <div className="mb-3">
        <p className="text-xs text-gray-400">TIME</p>
        <p className={`font-semibold ${darkMode ? "text-white" : "text-black"}`}>
          {selectedEvent.start_time} - {selectedEvent.end_time}
        </p>
      </div>

      {/* LOCATION */}
      <div className="mb-6">
        <p className="text-xs text-gray-400">LOCATION</p>
       <p className={`font-semibold ${darkMode ? "text-white" : "text-black"}`}>
          {selectedEvent.location || "TBA"}
        </p>
      </div>

      {/* CLOSE BUTTON */}
      <button
        onClick={() => setSelectedEvent(null)}
        className="
  mt-4
  w-full
  py-3
  rounded-xl
  bg-gradient-to-r
  from-[#3C0008]
  to-[#5C0010]
  text-white
  font-semibold
  shadow-[0_10px_25px_rgba(60,0,8,0.5)]
  transition duration-300
  hover:scale-[1.02]
"
      >
        Close
      </button>

    </div>
  </div>
)}

    </div>
  )
}