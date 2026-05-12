import { useEffect, useState } from "react"
import { Search } from "lucide-react"

export default function Membership({ darkMode }) {

  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

const itemsPerPage = 10
  const [semester, setSemester] = useState(
  localStorage.getItem("selectedTerm") || ""
)
const [terms, setTerms] = useState([])
  const filteredData = data.filter(m =>
  m.name.toLowerCase().includes(search.toLowerCase())
)
const indexOfLast = currentPage * itemsPerPage

const indexOfFirst = indexOfLast - itemsPerPage

const currentMembers =
  filteredData.slice(indexOfFirst, indexOfLast)

const totalPages =
  Math.ceil(filteredData.length / itemsPerPage)

  const loadData = async () => {
    const res = await fetch(
  `http://127.0.0.1:8000/api/membership/?semester=${semester}`,
  {
    credentials: "include"
  }
)

    const json = await res.json()

    setData(json.students || [])
    setTotal(json.total || 0)
  }
useEffect(() => {

  fetch("http://127.0.0.1:8000/api/schoolyears/")
    .then(res => res.json())
    .then(data => {

      const formatted = []

      data.forEach(year => {
        formatted.push(`1st Semester ${year}`)
        formatted.push(`2nd Semester ${year}`)
      })

      setTerms(formatted)

      const saved = localStorage.getItem("selectedTerm")

      if (saved && formatted.includes(saved)) {
        setSemester(saved)
      } else if (formatted.length > 0) {
        setSemester(formatted[0])
      }

    })

}, [])

useEffect(() => {

  const syncSemester = () => {

    const saved =
      localStorage.getItem("selectedTerm") || ""

    setSemester(saved)

  }

  syncSemester()

  window.addEventListener("storage", syncSemester)

  return () => {
    window.removeEventListener("storage", syncSemester)
  }

}, [])

useEffect(() => {

  if (semester) {
    loadData()
  }

}, [semester])

  const updateStatus = async (id, status) => {
    await fetch("http://127.0.0.1:8000/api/membership/update/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({
        id,
        status,
        amount: status === "PAID" ? 50 : 0
      })
    })

    loadData()
  }

  const paidCount = data.filter(m => m.status === "PAID").length
  const unpaidCount = data.filter(m => m.status === "UNPAID").length

  return (
    <div className="p-8 space-y-6">

      {/* HEADER */}
      <div>
        <p className="text-xs text-gray-400 mb-1">ORG MEMBERSHIP FEES</p>
        <h1
  className={`
    text-3xl font-bold
    ${
      darkMode
        ? "text-white"
        : "text-[#3C0008]"
    }
  `}
>
          Membership
        </h1>
        <p className="text-gray-400 text-sm mt-2">Manage student membership fees in every sem.</p>
      </div>

      {/* STATS CARDS */}
      <div className="grid md:grid-cols-3 gap-6">

        {/* TOTAL */}
        <div className="${
  darkMode
    ? `
      bg-gradient-to-br from-[#1F2937] to-[#111827]
      border border-[#374151]
      shadow-[0_15px_40px_rgba(0,0,0,0.7)]
    `
    : `
      bg-white
      border border-gray-200
      shadow-[0_10px_30px_rgba(0,0,0,0.08)]
    `
} p-6 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.7)]
border border-[#3C0008]/40
no-accent relative">
          <p className="text-gray-400 text-sm">TOTAL COLLECTED</p>
          <h2 className="text-3xl font-bold text-white">
            ₱{total}
          </h2>
        </div>

        {/* PAID */}
        <div className="${
  darkMode
    ? `
      bg-gradient-to-br from-[#1F2937] to-[#111827]
      border border-[#374151]
      shadow-[0_15px_40px_rgba(0,0,0,0.7)]
    `
    : `
      bg-white
      border border-gray-200
      shadow-[0_10px_30px_rgba(0,0,0,0.08)]
    `
} p-6 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.7)]
border border-[#3C0008]/40
no-accent">
          <p className="text-gray-400 text-sm">PAID MEMBERS</p>
          <h2 className="text-3xl font-bold text-[#300008]">
            {paidCount}
          </h2>
        </div>

        {/* UNPAID */}
        <div className="${
  darkMode
    ? `
      bg-gradient-to-br from-[#1F2937] to-[#111827]
      border border-[#374151]
      shadow-[0_15px_40px_rgba(0,0,0,0.7)]
    `
    : `
      bg-white
      border border-gray-200
      shadow-[0_10px_30px_rgba(0,0,0,0.08)]
    `
} p-6 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.7)]
border border-[#3C0008]/40
no-accent">
          <p className="text-gray-400 text-sm">UNPAID MEMBERS</p>
          <h2 className="text-3xl font-bold text-[#7A0014]">
            {unpaidCount}
          </h2>
        </div>

      </div>
<div className="relative w-[420px]">

  <div
    className={`
      flex items-center
      px-5 py-3
      rounded-full
      transition

      ${
        darkMode
          ? `
            bg-gradient-to-r
            from-[#1F2937]
            to-[#111827]

            border border-[#374151]

            shadow-[0_10px_30px_rgba(0,0,0,0.5)]
          `
          : `
            bg-white
            border border-[#3C0008]

            shadow-sm
          `
      }
    `}
  >

    <Search
      size={16}
      className={
        darkMode
          ? "text-gray-400"
          : "text-[#3C0008]"
      }
    />

    <input
      type="text"
      placeholder="Search students..."
      value={search}
      onChange={(e) => {
  setSearch(e.target.value)
  setCurrentPage(1)
}}
      className="
        ml-2
        w-full
        text-sm

        bg-transparent

        border-0
        border-none
        outline-none
        ring-0
        shadow-none

        focus:border-0
        focus:outline-none
        focus:ring-0
        focus:shadow-none

        appearance-none

        !border-none
        !ring-0
        !outline-none
      "
    />

  </div>

</div>

      {/* MEMBER LIST */}
      <div
  className={`
    no-accent
    rounded-3xl
    p-6
    transition

    ${
      darkMode
        ? `
          bg-gradient-to-br from-[#1F2937] to-[#111827]
          border border-[#374151]
          shadow-[0_15px_40px_rgba(0,0,0,0.7)]
        `
        : `
          bg-white
          border border-gray-200
          shadow-[0_10px_30px_rgba(0,0,0,0.08)]
        `
    }
  `}
>

        <div className="flex justify-between mb-4">
          <h2 className="font-semibold text-[#300008] text-lg">
            STUDENT MEMBERSHIP FEE
          </h2>
        </div>

        {data.length === 0 ? (
          <p className="text-gray-400">No members found</p>
        ) : (
          <div className="space-y-3">

            {currentMembers.map(m => (
              <div
                key={m.id}
                className={`
  flex justify-between items-center
  border-b
  pb-3
  text-[13.5px]
  transition

  ${
    darkMode
      ? `
        border-white/5
        hover:bg-transparent
      `
      : `
        border-gray-200
        hover:bg-gray-50
      `
  }
`}
              >

                {/* INFO */}
                <div>
                  <p className={`
  font-semibold
  text-[14.2px]
  ${
    darkMode
      ? "text-white"
      : ":text-black"
  }
`}>
                    {m.name}
                  </p>
                  <p className="text-sm text-gray-400">
                    Year {m.year}
                  </p>
                </div>

                {/* STATUS + ACTION */}
                <div className="flex items-center gap-3">

                  {/* STATUS BADGE */}
                  <span className={`
                    px-3 py-1 text-xs rounded-full font-medium
                    ${m.status === "PAID"
  ? `
      ${
        darkMode
          ? "bg-green-900/30 text-green-300"
          : "bg-green-100 text-green-700"
      }
    `
  : `
      ${
        darkMode
          ? "bg-[#5A000C]/30 text-[#FCA5A5]"
          : "bg-[#FDECEC] text-[#7A0014]"
      }
    `
}
                  `}>
                    {m.status}
                  </span>

                  {/* BUTTONS */}
                  <button
                    onClick={() => updateStatus(m.id, "PAID")}
                    className="
  bg-[#15803D]
  hover:bg-[#166534]
  text-white
  px-4 py-2
  rounded-xl
  text-sm
  transition
"
                  >
                    Paid
                  </button>

                  <button
                    onClick={() => updateStatus(m.id, "UNPAID")}
                    className="
  bg-[#3C0008]
  hover:bg-[#7A0014]
  text-white
  px-4 py-2
  rounded-xl
  text-sm
  transition
"
                  >
                    Unpaid
                  </button>

                </div>

              </div>
              
            ))}

          </div>
        )}
      </div>

      {/* PAGINATION */}
      <div className="flex justify-between items-center mt-4 px-2">

        <p className="text-sm text-gray-500">
          Showing {indexOfFirst + 1} to {Math.min(indexOfLast, filteredData.length)} of {filteredData.length} entries
        </p>

        <div className="flex gap-2 items-center">

          <button
            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
            className={`
              w-10 h-10
              flex items-center justify-center
              rounded-full
              transition

              ${
                darkMode
                  ? `
                    bg-[#0F172A]
                    border border-[#374151]
                    text-white
                    hover:bg-[#1F2937]
                  `
                  : `
                    bg-gray-200
                    text-[#3C0008]
                    hover:bg-gray-300
                  `
              }
            `}
          >
            {"<"}
          </button>

          {[...Array(totalPages)].slice(0, 5).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`
                px-3 py-1 rounded-full
                transition

                ${
                  currentPage === i + 1
                    ? darkMode
                      ? `
                          bg-[#5B0000]
                          text-white
                        `
                      : `
                          bg-[#3C0008]
                          text-white
                        `
                    : darkMode
                      ? `
                          bg-[#0F172A]
                          border border-[#374151]
                          text-white
                          hover:bg-[#1F2937]
                        `
                      : `
                          bg-gray-200
                          text-[#3C0008]
                          hover:bg-gray-300
                        `
                }
              `}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
            className={`
              w-10 h-10
              flex items-center justify-center
              rounded-full
              transition

              ${
                darkMode
                  ? `
                    bg-[#0F172A]
                    border border-[#374151]
                    text-white
                    hover:bg-[#1F2937]
                  `
                  : `
                    bg-gray-200
                    text-[#3C0008]
                    hover:bg-gray-300
                  `
              }
            `}
          >
            {">"}
          </button>

        </div>

      </div>

    </div>
  )
}