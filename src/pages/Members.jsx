import { useState, useEffect } from "react"
import { Search, Download, Printer } from "lucide-react"
import { MoreVertical } from "lucide-react"
import { Trash2 } from "lucide-react"

export default function Members({ darkMode }) {

  const [search, setSearch] = useState("")
  const [editing, setEditing] = useState(null)
  const [members, setMembers] = useState([])
  const [yearFilter, setYearFilter] = useState("")
  const [deleteTarget, setDeleteTarget] = useState(null)
const [successMessage, setSuccessMessage] = useState("")
const [activeMemberMenu, setActiveMemberMenu] = useState(null)
const [customYears, setCustomYears] = useState([])
const [showYearModal, setShowYearModal] = useState(false)
const [newYearInput, setNewYearInput] = useState("")
const [showYearDropdown, setShowYearDropdown] = useState(false)
const [deleteYearTarget, setDeleteYearTarget] = useState(null)

useEffect(() => {
  const savedYear = localStorage.getItem("selectedYear")

  if (savedYear) {
    setYearFilter(savedYear)
  } else {
    setYearFilter("2026") // or your latest year
  }
}, [])

useEffect(() => {
  const saved = localStorage.getItem("customYears")

  if (saved) {
    setCustomYears(JSON.parse(saved))
  }
}, [])

const years = [
  ...new Set([
    ...members
      .filter(m => m.role !== "STUDENT")
      .map(m => m.year),
    ...customYears
  ])
].sort()

  // 🔥 FETCH MEMBERS FROM DJANGO
  const fetchMembers = async () => {
    try {
      const res = await fetch("https://org-manager-o05u.onrender.com/api/members/", {
      credentials: "include"
})
      const data = await res.json()
      setMembers(data)
    } catch (err) {
      console.error("Fetch error:", err)
    }
  }

  useEffect(() => {
    fetchMembers()
  }, [])

  // 🔥 SAVE (ADD OR UPDATE)
const handleSave = async () => {
  try {
    const formData = new FormData()

    formData.append("id", editing.id || "")
    formData.append("name", editing.name)
    formData.append("email", editing.email)
    formData.append("role", editing.role)
    formData.append("status", editing.status)
    formData.append("contact", editing.contact || "")
    formData.append("year", editing.year)
    formData.append("year_level", editing.year_level)

    // 🔥 THIS IS THE KEY
    if (editing.file) {
      formData.append("image", editing.file)
    }

    await fetch("https://org-manager-o05u.onrender.com/api/members/save/", {
  method: "POST",
  credentials: "include",
  body: formData
})

    await fetchMembers()

    setYearFilter(editing.year)
localStorage.setItem("selectedYear", editing.year)

    setEditing(null)

    setSuccessMessage("Member saved successfully!")

  } catch (err) {
    console.error(err)
  }
}

  // 🔥 DELETE MEMBER
  const handleDelete = async (id) => {
  try {
    await fetch("https://org-manager-o05u.onrender.com/api/members/delete/", {
  method: "POST",
  credentials: "include",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ id })
})

    fetchMembers()
    setSuccessMessage("Member deleted successfully!")

  } catch (err) {
    console.error(err)
  }
}

const handleDeleteYear = () => {
  const updated = customYears.filter(y => y !== deleteYearTarget)

  setCustomYears(updated)
  localStorage.setItem("customYears", JSON.stringify(updated))

  // reset if deleted current
  if (yearFilter === deleteYearTarget) {
    const fallback = updated[0] || "1"
    setYearFilter(fallback)
    localStorage.setItem("selectedYear", fallback)
  }

  setDeleteYearTarget(null)
}

const handleAddYear = () => {
  if (!newYearInput) return

  if (!years.includes(newYearInput)) {
    const updated = [...customYears, newYearInput]

    setCustomYears(updated)
    localStorage.setItem("customYears", JSON.stringify(updated))

    setYearFilter(newYearInput)
    localStorage.setItem("selectedYear", newYearInput)
  }

  setNewYearInput("")
  setShowYearModal(false)
}

  return (
    <div className="p-8 min-h-screen">

      {/* HEADER */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <p className="text-xs text-gray-400 mb-1">LIST OF ITS MEMBERS</p>
          <h1 className="text-3xl font-bold text-[#3C0008]">ITS Officers</h1>
          <p className="text-gray-400 text-sm mt-2">Manage student organization records and officer statuses.</p>
        </div>
      </div>


      {/* FILTER */}
     {/* FILTER */}

        <div className="flex flex-wrap items-center gap-4">

         <div
  className={`
    flex items-center px-5 py-3 rounded-full w-[600px]
    border transition

    ${
      darkMode
        ? `
          bg-gradient-to-r from-[#1F2937] to-[#111827]
          border-[#374151]
          shadow-[0_10px_30px_rgba(0,0,0,0.5)]
        `
        : `
          bg-white
          border-[#3C0008]
        `
    }
  `}
>

            <Search size={16}/>
           <input
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  placeholder="Search by name..."
  className={`
    ml-2
    w-full
    text-sm

    bg-transparent

    ${darkMode ? "text-gray-300" : "text-black"}

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
  `}
/>
          </div>

          <button
            onClick={() =>
              setEditing({
                id: null, // 🔥 IMPORTANT (backend handles id)
                name: "",
                email: "",
                role: "",
                status: "ACTIVE",
                dept: "",
                image: "https://i.pravatar.cc/100",

                year: yearFilter || "2026",
                year_level: "1"
              })
            }
            className="
  ml-auto
  bg-gradient-to-r from-[#3C0008] to-[#5C0010]
  !text-white hover:!text-white
  px-5 py-2 rounded-full text-sm font-semibold
  shadow-[0_10px_25px_rgba(60,0,8,0.5)]
  hover:scale-[1.03]
  hover:shadow-[0_15px_35px_rgba(60,0,8,0.7)]
  active:scale-95
  transition duration-300
"
          >
            + Add Member
          </button>

<div className="relative z-10">

  {/* SELECT BUTTON */}
  <div
  onClick={() => setShowYearDropdown(!showYearDropdown)}
  className={`
    px-5 py-2
    rounded-full
    text-sm
    font-medium
    cursor-pointer
    transition duration-300
    flex items-center gap-2

    ${
      darkMode
        ? `
          bg-[#1F2937]
          border border-[#374151]
          text-white
          shadow-[0_10px_30px_rgba(0,0,0,0.5)]
        `
        : `
          bg-white
          border border-[#3C0008]
          text-[#3C0008]
          shadow-sm
          hover:shadow-xl
        `
    }
  `}
>
    <span className="mr-2">{yearFilter}</span>

  <span
    className={`text-[10px] transition-transform duration-200 ${
      showYearDropdown ? "rotate-180" : ""
    }`}
  >
    ▼
  </span>
  </div>

  {/* DROPDOWN */}
  {showYearDropdown && (
    <div className={`
  absolute right-0 mt-2 w-44
  rounded-xl z-50 overflow-hidden border

  ${
    darkMode
      ? `
        bg-[#1F2937]
        border-gray-700
        shadow-[0_25px_60px_rgba(0,0,0,0.7)]
      `
      : `
        bg-white
        border-gray-200
        shadow-[0_20px_50px_rgba(0,0,0,0.25)]
      `
  }
`}>
    {years.map((y) => (
  <div
    key={y}
className={`
flex items-center justify-between
px-4 py-2 text-sm transition

${
  darkMode
    ? `
      text-white
      hover:bg-[#374151]
    `
    : `
      text-gray-700
      hover:bg-gray-200
    `
}
`} >

    {/* YEAR */}
   <span
  onClick={() => {
    setYearFilter(y)
    localStorage.setItem("selectedYear", y)
    setShowYearDropdown(false)
  }}
  className={`
    cursor-pointer
    ${darkMode ? "text-white" : "text-[#3C0008]"}
  `}
>
  {y}
</span>

    {/* TRASH */}
    <Trash2
      size={14}
      onClick={(e) => {
        e.stopPropagation()
        setDeleteYearTarget(y)
      }}
      className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 cursor-pointer transition"
    />

  </div>
))}

      {/* ADD YEAR */}
      <div
        onClick={() => {
          setShowYearModal(true)
          setShowYearDropdown(false)
        }}
       className={`
px-4 py-2 text-sm font-medium cursor-pointer border-t transition

${
  darkMode
    ? `
      text-white
      border-gray-700
      hover:bg-[#374151]
    `
    : `
      text-[#3C0008]
      border-gray-200
      hover:bg-gray-200
    `
}
`}>
        + Add Year
      </div>

    </div>
  )}

        </div>
      </div>

      {/* TABLE */}
   <div
  className={`
    col-span-2
    mt-6
    p-6
    rounded-3xl
    no-accent

    ${
      darkMode
        ? `
          bg-gradient-to-br from-[#1F2937] to-[#111827]
          text-white
          border border-white/5
          shadow-[0_15px_40px_rgba(0,0,0,0.7)]
        `
        : `
          bg-white
          text-gray-700
          border border-gray-200
          shadow-[0_10px_30px_rgba(0,0,0,0.08)]
        `
    }
  `}
>

       <div
  className={`
    grid grid-cols-[0.8fr_1.5fr_1fr_1fr_1.5fr_1fr_0.8fr]
    px-6 pt-3 pb-4
    text-sm font-bold tracking-wider
    bg-transparent

    ${darkMode ? "text-white" : "text-[#3C0008]"}
  `}
>

  <p className="text-center">PICTURE</p>
  <p className="text-center">NAME</p>
  <p className="text-center">YEAR</p>
  <p className="text-center">POSITION</p>
  <p className="text-center">EMAIL</p>
  <p className="text-center">CONTACT</p>
  <p className="text-center">ACTION</p>

</div>

        {members
          .filter(m =>
  m.name?.toLowerCase().includes(search.toLowerCase()) &&
 m.role !== "STUDENT" && m.role !== "STUDENT" && String(m.year) === String(yearFilter)
)
          .map((m) => (
            <div
  key={m.id}
  className={`
  grid grid-cols-[0.8fr_1.5fr_1fr_1fr_1.5fr_1fr_0.8fr]
  px-6 py-5 items-center text-sm
  border-t
  transition

  ${
    darkMode
      ? "border-[#374151]"
      : "border-gray-100"
  }
`}
>

              {/* PICTURE */}
<div className="flex justify-center items-center">
  <img
    src={m.image ? m.image : "/default-avatar.png"}
    className="w-14 h-14 object-cover rounded-md"
  />
</div>

{/* NAME */}
<p className="text-center font-semibold">
  {m.name}
</p>

<p
  className={`
    text-center text-sm
    ${darkMode ? "text-gray-300" : "text-gray-600"}
  `}
>
  {m.year_level === "1" && "1st Year"}
  {m.year_level === "2" && "2nd Year"}
  {m.year_level === "3" && "3rd Year"}
  {m.year_level === "4" && "4th Year"}
</p>            

{/* POSITION */}
<p className="text-center">
  {m.role}
</p>

{/* EMAIL */}
<div className="text-center text-sm">
  <p className="text-gray-400 break-words">
    {m.email}
  </p>
</div>

{/* CONTACT */}
<p className="text-center">
  {m.contact || "N/A"}
</p>

             <div className="relative flex items-center justify-center">

  {/* 3 DOT BUTTON */}
  <MoreVertical
    className="cursor-pointer text-gray-400 hover:text-gray-600"
    onClick={() => {
      setActiveMemberMenu(activeMemberMenu === m.id ? null : m.id)
    }}
  />

  {/* DROPDOWN */}
  {activeMemberMenu === m.id && (
    <div className={`
absolute right-2 top-8
rounded-lg w-32 z-50

${
  darkMode
    ? `
      bg-[#1F2937]
      shadow-[0_20px_50px_rgba(0,0,0,0.7)]
    `
    : `
      bg-white
      shadow-[0_15px_40px_rgba(0,0,0,0.3)]
    `
}
`}>

      {/* EDIT */}
      {/* EDIT */}
<div
  onClick={() => {
    setEditing(m)
    setActiveMemberMenu(null)
  }}
  className={`
    px-4 py-2 cursor-pointer text-sm transition

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
    setDeleteTarget(m)
    setActiveMemberMenu(null)
  }}
  className={`
    px-4 py-2 cursor-pointer text-sm transition

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
        ))}

      </div>

      {/* MODAL */}
     {editing && (
  <div className="
fixed inset-0
bg-black/25
backdrop-blur-[2px]
flex items-center justify-center
z-50
">

  <div
  className={`
    w-[420px] rounded-3xl p-8 transition

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
>

      {/* TITLE */}
      <h2 className={`
text-xl font-bold mb-6 text-center
${darkMode ? "text-white" : "text-[#3C0008]"}
`}>
        {editing.id ? "Edit Member" : "Add Member"}
      </h2>

      {/* IMAGE */}
      <label className="cursor-pointer flex justify-center mb-6">
        <img
          src={editing?.image || "/default-avatar.png"}
          alt="preview"
          className="w-24 h-24 object-cover rounded-xl border border-gray-300 dark:border-gray-600 shadow-sm"
        />

        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files[0]
            if (!file) return

            setEditing({
              ...editing,
              file: file,
              image: URL.createObjectURL(file)
            })
          }}
        />
      </label>

      {/* FORM */}
      <div className="space-y-3">

        <input
          placeholder="Full Name"
          value={editing.name}
          onChange={(e) => setEditing({...editing, name: e.target.value})}
          className={`
w-full px-4 py-3 rounded-xl outline-none text-sm transition

${
  darkMode
    ? `
      bg-[#2A2F3A]
      text-gray-200
      placeholder-gray-500
    `
    : `
      bg-gray-100
      border border-gray-300
      text-[#3C0008]
      placeholder-gray-500
    `
}
`}    />

        <select
  value={editing.year_level}
  onChange={(e) =>
    setEditing({ ...editing, year_level: e.target.value })
  }
  className={`
w-full px-4 py-3 rounded-xl outline-none text-sm transition
appearance-none

${
  darkMode
    ? `
      bg-[#0F172A]
      border border-[#374151]
      text-gray-200
    `
    : `
      bg-gray-200
      border border-gray-300
      text-gray-500
    `
}
`}
>
  <option value="1">1st Year</option>
  <option value="2">2nd Year</option>
  <option value="3">3rd Year</option>
  <option value="4">4th Year</option>
</select>

        <input
          placeholder="Position"
          value={editing.role}
          onChange={(e) => setEditing({...editing, role: e.target.value})}
          className={`
w-full px-4 py-3 rounded-xl outline-none text-sm transition

${
  darkMode
    ? `
      bg-[#2A2F3A]
      text-gray-200
      placeholder-gray-500
    `
    : `
      bg-gray-100
      border border-gray-300
      text-[#3C0008]
      placeholder-gray-500
    `
}
`}  
        />

        <input
          placeholder="Email"
          value={editing.email}
          onChange={(e) => setEditing({...editing, email: e.target.value})}
         className={`
w-full px-4 py-3 rounded-xl outline-none text-sm transition

${
  darkMode
    ? `
      bg-[#2A2F3A]
      text-gray-200
      placeholder-gray-500
    `
    : `
      bg-gray-100
      border border-gray-300
      text-[#3C0008]
      placeholder-gray-500
    `
}
`}   />

      

      <input
  placeholder="Contact No."
  value={editing.contact || ""}
  onChange={(e) => setEditing({...editing, contact: e.target.value})}
  className={`
w-full px-4 py-3 rounded-xl outline-none text-sm transition

${
  darkMode
    ? `
      bg-[#2A2F3A]
      text-gray-200
      placeholder-gray-500
    `
    : `
      bg-gray-100
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
    onClick={() => setEditing(null)}
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
    onClick={handleSave}
  className={`
px-6 py-2 rounded-xl
text-sm font-medium
shadow-md
transition

${
  darkMode
    ? `
      bg-[#3C0008]
      hover:bg-[#5B0000]
      text-white
    `
    : `
      bg-[#3C0008]
      hover:bg-[#5B0000]
      text-white
    `
}
`}>
    Save
  </button>

</div>

    </div>
  </div>
)}
{deleteTarget && (
  <div
    className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
    onClick={() => setDeleteTarget(null)}
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

      {/* TITLE */}
      <h2 className={`
text-xl
font-bold
mb-4

${
  darkMode
    ? "text-white"
    : "text-[#3C0008]"
}
`}>
        Delete Member
      </h2>

      {/* MESSAGE */}
      <p className={`
text-[17px]
leading-relaxed
mb-8

${darkMode ? "text-gray-400" : "text-gray-500"}
`}>
        Are you sure you want to delete? <br />
        <span
  className={`
    font-semibold
    ${
      darkMode
        ? "text-white"
        : "text-gray-800"
    }
  `}
>
          {deleteTarget.name}
        </span>
      </p>

      {/* BUTTONS */}
     <div className="flex justify-center gap-5">

        <button
          onClick={() => setDeleteTarget(null)}
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
          onClick={() => {
            handleDelete(deleteTarget.id)
            setDeleteTarget(null)
          }}
          className={`
px-7 py-3
rounded-xl
font-medium
transition

${
  darkMode
    ? `
      bg-[#3C0008]
      hover:bg-[#5C0010]
      text-white
    `
    : `
      bg-[#3C0008]
      hover:bg-[#5C0010]
      text-white
    `
}
`}
        >
          Yes, Delete
        </button>

      </div>

    </div>
  </div>
)}

{showYearModal && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

    <div
      className={`
        rounded-2xl
        p-6
        w-[350px]
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
    >

      {/* TITLE */}
      <h2
        className={`
          text-xl
          font-bold
          mb-4

          ${
            darkMode
              ? "text-white"
              : "text-[#3C0008]"
          }
        `}
      >
        Add New Year
      </h2>

      {/* INPUT */}
      <input
        type="text"
        placeholder="Enter year (e.g. 2029)"
        value={newYearInput}
        onChange={(e) => setNewYearInput(e.target.value)}
        className={`
          w-full
          px-4 py-3
          rounded-xl
          outline-none
          text-sm
          transition
          mb-6

          ${
            darkMode
              ? `
                bg-[#0F172A]
                border border-[#374151]
                text-white
                placeholder-gray-500
              `
              : `
                bg-gray-100
                border border-gray-300
                text-black
                placeholder-gray-500
              `
          }
        `}
      />

      {/* BUTTONS */}
      <div className="flex justify-center gap-5">

        <button
          onClick={() => setShowYearModal(false)}
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
          onClick={handleAddYear}
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
          Save
        </button>

      </div>

    </div>

  </div>
)}

{deleteYearTarget && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

    <div
  className={`
    rounded-2xl
    p-6
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
        Delete Year
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
        Delete <strong>{deleteYearTarget}</strong>?
      </p>

      <div className="flex justify-center gap-5">

        <button
          onClick={() => setDeleteYearTarget(null)}
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
      text-[#3C0008]
      hover:bg-gray-300
    `
}
`}
        >
          Cancel
        </button>

        <button
          onClick={handleDeleteYear}
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
    </div>
  )
}