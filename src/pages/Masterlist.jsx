import { Download, Printer, Eye, Search, Trash2 } from "lucide-react"
import { useState, useEffect } from "react"
import * as pdfjsLib from "pdfjs-dist"
import * as XLSX from "xlsx"

pdfjsLib.GlobalWorkerOptions.workerSrc =
  `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`

export default function Masterlist({ darkMode }) {

  const [terms, setTerms] = useState([])
  const [selectedTerm, setSelectedTerm] = useState("")
  const [archives, setArchives] = useState({})
  const [showModal, setShowModal] = useState(false)
  const [newYear, setNewYear] = useState("")
  const [showManageModal, setShowManageModal] = useState(false)
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showYearDeleteModal, setShowYearDeleteModal] = useState(false)
const [selectedYearDelete, setSelectedYearDelete] = useState("")
const itemsPerPage = 10
  

  // ✅ LOAD TERMS FROM BACKEND
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
          setSelectedTerm(saved)
        } else if (formatted.length > 0) {
          setSelectedTerm(formatted[0])
        }
      })
  }, [])

  useEffect(() => {
  if (!selectedTerm) return

  fetch("http://127.0.0.1:8000/api/members/")
    .then(res => res.json())
    .then(data => {

      // OPTIONAL: filter by year if needed
      const filtered = data.filter(
  m =>
    (m.semester || "").toLowerCase().trim() ===
    selectedTerm.toLowerCase().trim()
)

      setArchives(prev => ({
        ...prev,
        [selectedTerm]: filtered
      }))

      localStorage.setItem(
  "selectedTerm",
  selectedTerm
)
    })
}, [selectedTerm])

  // ✅ SAVE SELECTED TERM
  useEffect(() => {
    if (selectedTerm) {
      localStorage.setItem("selectedTerm", selectedTerm)
    }
  }, [selectedTerm])

  // 🔥 HANDLE FILE UPLOAD
 const handleFile = async (file) => {

  if (!file) return
  setUploading(true)
  setUploadSuccess(false)
  try {

  

  console.log("FILE:", file)

  // 📄 PDF FILE
  if (file.type === "application/pdf") {

    const reader = new FileReader()

    reader.onload = async function () {

      const typedArray = new Uint8Array(this.result)
      const pdf = await pdfjsLib.getDocument(typedArray).promise

      let textContent = ""

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        const strings = content.items.map(item => item.str)
        textContent += strings.join(" ") + "\n"
      }

      console.log("PDF TEXT:", textContent)

      const matches = textContent.match(/\d+\s+[A-ZÑ.,\s]+?\s+BSIT\s+\d\s+[MF]/g) || []

      const extracted = matches.map(line => {
        const parts = line.trim().split(/\s+BSIT\s+/)
        const namePart = parts[0].replace(/^\d+\s+/, "")
        const rest = parts[1].split(" ")

        return {
          name: namePart,
          course: "BSIT",
          year: rest[0],
          sex: rest[1],
          status: "ACTIVE",
          initials: namePart.split(" ").map(w => w[0]).join("").slice(0, 2)
        }
      })


      // 🔥 ADD THIS HERE
await fetch("http://127.0.0.1:8000/api/masterlist/upload/", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
  semester: selectedTerm,   // 🔥 CHANGE THIS
  students: extracted
})
})

setUploadSuccess(true)
setUploading(false)
setUploading(false)



// 🔥 ADD THIS (RELOAD AFTER PDF UPLOAD)
const res = await fetch("http://127.0.0.1:8000/api/members/")
const dataReload = await res.json()

const filtered = dataReload.filter(
  m =>
    (m.semester || "").toLowerCase().trim() ===
    selectedTerm.toLowerCase().trim()
) 

setArchives(prev => ({
  ...prev,
  [selectedTerm]: filtered
}))

localStorage.setItem(
  "selectedTerm",
  selectedTerm
)
    }

    reader.readAsArrayBuffer(file)
  }

  // 📊 EXCEL FILE
  else if (
    file.name.endsWith(".xlsx") ||
    file.name.endsWith(".xls")
  ) {

    const data = await file.arrayBuffer()
    const workbook = XLSX.read(data)

    // ✅ READ ALL SHEETS
let allData = []

workbook.SheetNames.forEach(sheetName => {
  const sheet = workbook.Sheets[sheetName]
  const json = XLSX.utils.sheet_to_json(sheet)

  allData = [...allData, ...json]
})

console.log("ALL SHEETS DATA:", allData)


 console.log("ALL DATA:", allData)

 const extracted = allData

  .map(row => {

    const values = Object.values(row)

    let name = ""

    for (let v of values) {

     if (
  typeof v === "string" &&
  v.trim().length > 3 &&
  !v.includes("@") &&
  !v.match(/^\d+$/)
) {

        name = v.trim()
        break

      }

    }

    name = name
      .replace(/^\d+\s*/, "")
      .replace(/\s+/g, " ")
      .trim()

    let year = ""

    for (let v of values) {
      if (v === 1 || v === 2 || v === 3 || v === 4) {
        year = v
        break
      }
    }

    let sex = ""

    for (let v of values) {
      if (v === "M" || v === "F") {
        sex = v
        break
      }
    }

    return {
      name: name,
      course: "BSIT",
      year: String(year),
      sex: sex,
      status: "ACTIVE",
      initials: name
        ? name.split(" ").map(w => w[0]).join("").slice(0, 2)
        : ""
    }

  })

  .filter(student =>
    student.name &&
    student.name.trim() !== "" &&
    student.name.length > 3
  )

  console.log("EXTRACTED:", extracted)


    // 🔥 ADD THIS HERE
await fetch("http://127.0.0.1:8000/api/masterlist/upload/", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    semester: selectedTerm,
    students: extracted
  })
})

setUploadSuccess(true)
setUploading(false)
setUploading(false)





// 🔥 RELOAD FROM BACKEND
const res = await fetch("http://127.0.0.1:8000/api/members/")
const dataReload = await res.json()

console.log("RELOADED:", dataReload)

const filtered = dataReload.filter(
  m =>
    (m.semester || "").toLowerCase().trim() ===
    selectedTerm.toLowerCase().trim()
)

setArchives(prev => ({
  ...prev,
  [selectedTerm]: filtered
}))
localStorage.setItem(
  "selectedTerm",
  selectedTerm
)

  }

   else {
    alert("Unsupported file type. Upload PDF or Excel.")
  }

} catch (err) {

  console.error(err)

  alert("Upload failed.")

  setUploading(false)

}
}

const students = archives[selectedTerm] || []

const filteredStudents = students.filter(s => {

  const studentName =
    s.name ||
    s.full_name ||
    ""

  return studentName
    .toLowerCase()
    .includes(search.toLowerCase())

})

const totalStudents = filteredStudents.length

// 🔥 PAGINATION LOGIC
const indexOfLast = currentPage * itemsPerPage
const indexOfFirst = indexOfLast - itemsPerPage
const currentStudents = filteredStudents.slice(indexOfFirst, indexOfLast)

const totalPages = Math.ceil(totalStudents / itemsPerPage)

  return (
    <div className="p-8 min-h-screen">

      {/* HEADER */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <p className="text-xs text-gray-400 mb-1">ACADEMIC RECORDS</p>
          <h1
  className={`
    text-3xl font-bold
    ${darkMode ? "text-white" : "text-[#3C0008]"}
  `}
>Masterlist Archive</h1>
          <p className="text-gray-400 text-sm mt-2">Upload a PDF masterlist and switch between semesters.</p>
        </div>
      </div>

      {/* DROPDOWN */}
      <div className="flex items-center justify-between mb-6 gap-4">

  {/* 🔍 LEFT SIDE (Search) */}
 {/* 🔍 LEFT SIDE (Search) */}
<div
  className={`
    flex items-center px-5 py-3 rounded-full w-[600px]
    border transition
    no-accent

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
  placeholder="Search student..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  className={`
    ml-2
    w-full
    text-sm

    bg-transparent

    ${
      darkMode
        ? "text-gray-300"
        : "text-black"
    }

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

  {/* 👉 RIGHT SIDE (Dropdown + Delete) */}
  <div className="flex items-center gap-4">

      {/* 🔥 DELETE BUTTON */}
  <button
  onClick={() => {
    if (!selectedTerm) return
    setShowDeleteModal(true)
  }}
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
  <div className="flex items-center gap-2">
    <Trash2 size={16} />
    <span>DELETE</span>
  </div>
</button>

    {/* 📅 DROPDOWN */}
    <div
  className={`
    no-accent
    p-5 rounded-3xl w-[320px]
    transition duration-300

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
          shadow-[0_10px_30px_rgba(0,0,0,0.12)]
        `
    }
  `}
>
      <p className="text-xs text-gray-400 mb-2">
        SELECT SEMESTER/ACADEMIC YEAR
      </p>

      <select
        value={selectedTerm}
        onChange={(e) => {
          if (e.target.value === "custom") {
            setShowModal(true)
          } else if (e.target.value === "manage") {
            setShowManageModal(true)
          } else {
            setSelectedTerm(e.target.value)
          }
        }}
       className={`
w-full
px-5 py-3
rounded-full
text-sm font-semibold
outline-none
transition
appearance-none
cursor-pointer

${
  darkMode
    ? `
      bg-[#0F172A]
      border border-[#374151]
      text-white
      shadow-[0_10px_30px_rgba(0,0,0,0.5)]
    `
    : `
      bg-white
      border border-[#3C0008]
      text-[#3C0008]
      shadow-sm
      hover:bg-[#FFF5F5]
    `
}
`}
      >
        {[...terms]
  .sort((a, b) => {
    const getYear = (str) => parseInt(str.match(/\d{4}/)[0])

    const yearA = getYear(a)
    const yearB = getYear(b)

    // 🔥 sort by year
    if (yearA !== yearB) return yearA - yearB

    // 🔥 1st semester first
    if (a.includes("1st")) return -1
    if (b.includes("1st")) return 1

    return 0
  })
  .map((term, i) => (
    <option key={i} value={term}>{term}</option>
))}
        <option value="custom">+ Add Custom Year</option>
        <option value="manage">⚙ Manage Years</option>
      </select>
    </div>

  

  </div>

</div>
      {/* DRAG & DROP */}
     <div
  onDrop={(e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    handleFile(file)
  }}

  
  onDragOver={(e) => e.preventDefault()}
  className={`
    no-accent
    border-2 border-dashed
    ${darkMode ? "border-[#374151]" : "border-gray-300"}
    p-10 rounded-3xl mb-6 text-center cursor-pointer hover:border-[#3C0008] transition
  `}
>
  <p className={`
    mb-2
    ${darkMode ? "text-gray-400" : "text-gray-500"}
  `}>

  {uploading
    ? "Uploading and processing file..."
    : "Drag & Drop your PDF or Excel file here"}

</p>

{uploading && (

  <div className="flex justify-center mb-4">

    <div className="
      w-8 h-8
      border-4 border-gray-300
      border-t-[#3C0008]
      rounded-full
      animate-spin
    "/>

  </div>

)}

{uploadSuccess && (

  <p className="text-[#3C0008] text-sm font-semibold mb-3">
    Masterlist uploaded successfully!
  </p>

)}

  <p className="text-xs text-gray-400 mb-4">
    Supported: PDF, XLSX, XLS
  </p>

<input
  type="file"
  disabled={uploading}
  accept=".pdf,.xlsx,.xls"
  className="mt-2"

  onChange={async (e) => {

    const file = e.target.files[0]

    if (!file) return

    await handleFile(file)

    // ✅ reset input
    e.target.value = ""

    // ✅ reset pagination
    setCurrentPage(1)

  }}
/>
</div>

      {/* TABLE */}
      <div className={`
      no-accent
rounded-3xl
p-10 text-center
transition duration-300

${
  darkMode
    ? `
      bg-gradient-to-br from-[#1F2937] to-[#111827]
      border border-[#374151]
      text-white
      shadow-[0_20px_60px_rgba(0,0,0,0.8)]
    `
    : `
      bg-white
      border border-black/5
      shadow-[0_10px_30px_rgba(0,0,0,0.15)]
    `
}
`}>

        <div
  className={`
    grid grid-cols-5
    px-6 py-3
    text-sm font-bold tracking-wider
    border-b

    ${
      darkMode
        ? `
          text-white
          border-[#374151]
        `
        : `
          text-[#3C0008]
          border-gray-200
        `
    }
  `}
>
          <p>STUDENT NAME</p>
          <p>COURSE</p>
          <p>YEAR</p>
          <p>SEX</p>
          <p>REMARKS</p>
        </div>

        {currentStudents.map((s, i) => (
    <div key={i} className={`
grid grid-cols-5
px-6 py-5
items-center
border-b
text-[13.5px]
transition

${
  darkMode
    ? `
      border-[#374151]
      hover:bg-[#1F2937]
      text-white
    `
   : `
      border-gray-200
      hover:bg-gray-50
      text-gray-500
    `
}
`}>

      <div className="flex items-center">
        
        <p
  className={`
    font-semibold
    ${
      darkMode
        ? "text-white"
        : "text-gray-800"
    }
  `}
>
  {s.name || s.full_name}
</p>
      </div>

      <p>{s.course || s.dept}</p>
      <p>{s.year}</p>
      <p>{s.sex}</p>
      <p>{s.status}</p>

    

    </div>
))}

      </div>
  {/* END TABLE */}

<div className="flex justify-between items-center mt-4 px-2">

  {/* LEFT TEXT */}
  <p className="text-sm text-gray-500">
    Showing {indexOfFirst + 1} to {Math.min(indexOfLast, totalStudents)} of {totalStudents} entries
  </p>

  {/* BUTTONS */}
  <div className="flex gap-2 items-center">

    <button
      onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
      className={`
w-10 h-10
flex items-center justify-center
rounded-full
transition
outline-none
focus:outline-none
focus:ring-0

${
  darkMode
    ? `
      bg-[#0F172A]
      border border-[#374151]
      text-white
      hover:bg-[#1F2937]
      active:bg-[#5B0000]
    `
    : `
      bg-gray-200
      text-[#3C0008]
      hover:bg-gray-300
      active:bg-[#5B0000]
      active:text-white
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
  outline-none
  focus:outline-none
  focus:ring-0
  active:outline-none
  transition
          ${
  currentPage === i + 1
    ? darkMode
      ? `
          bg-[#5B0000]
text-white
shadow-[0_8px_20px_rgba(91,0,0,0.45)]
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
outline-none
focus:outline-none
focus:ring-0

${
  darkMode
    ? `
      bg-[#0F172A]
      border border-[#374151]
      text-white
      hover:bg-[#1F2937]
      active:bg-[#5B0000]
    `
    : `
      bg-gray-200
      text-[#3C0008]
      hover:bg-gray-300
      active:bg-[#5B0000]
      active:text-white
    `
}
`}

    >
      {">"}
    </button>

  </div>
</div>

      {/* ADD MODAL */}
     {showModal && (
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
        Add School Year
      </h2>

      {/* INPUT */}
      <input
        type="text"
        placeholder="2028-2029"
        value={newYear}
        onChange={(e) => setNewYear(e.target.value)}
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
          onClick={() => setShowModal(false)}
          className={`
            px-5 py-2
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
          onClick={async () => {
            if (!newYear) return

            await fetch("http://127.0.0.1:8000/api/schoolyears/add/", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name: newYear })
            })

            const res = await fetch("http://127.0.0.1:8000/api/schoolyears/")
            const data = await res.json()

            const formatted = []

            data.forEach(year => {
              formatted.push(`1st Semester ${year}`)
              formatted.push(`2nd Semester ${year}`)
            })

            setTerms(formatted)

            const newSelected = `1st Semester ${newYear}`

            setSelectedTerm(newSelected)

            setShowModal(false)
            setNewYear("")
          }}
          className="
            px-5 py-2
            rounded-xl
            font-medium
            bg-[#3C0008]
            hover:bg-[#5C0010]
            text-white
            transition
          "
        >
          Add
        </button>

      </div>

    </div>

  </div>
)}

      {showManageModal && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

    <div
      className={`
  relative
  rounded-2xl
  p-6
  w-[420px]
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

<button
  onClick={() => setShowManageModal(false)}
  className={`
    absolute top-4 right-5
    text-2xl font-bold
    z-50
    transition

    ${
      darkMode
        ? "text-gray-400 hover:text-white"
        : "text-gray-500 hover:text-black"
    }
  `}
>
  ×
</button>

      {/* TITLE */}
      <h2
        className={`
          text-xl
          font-bold
          mb-5

          ${
            darkMode
              ? "text-white"
              : "text-[#3C0008]"
          }
        `}
      >
        Manage School Years
      </h2>

      {/* LIST */}
      <div className="space-y-3 max-h-[320px] overflow-y-auto custom-scrollbar pr-1">

        {terms.map((term, i) => (

          <div
            key={i}
            className={`
              flex justify-between items-center
              px-4 py-3
              rounded-xl
              transition

              ${
                darkMode
                  ? `
                    bg-[#111827]
                    border border-[#1F2937]
                  `
                  : `
                    bg-gray-100
                    border border-gray-200
                  `
              }
            `}
          >

            <span
              className={`
                text-sm font-medium

                ${
                  darkMode
                    ? "text-white"
                    : "text-gray-800"
                }
              `}
            >
              {term}
            </span>

            <button
              onClick={() => {
  setSelectedYearDelete(term)
  setShowYearDeleteModal(true)
}}

              className="
                px-4 py-2
                rounded-lg
                text-sm
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
        ))}

      </div>

      {/* CLOSE BUTTON */}
    

    </div>

  </div>
)}

{showDeleteModal && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

    <div
      className={`
        relative
rounded-2xl
p-6
w-[350px]
text-center
transition

        ${
          darkMode
            ? `
              bg-[#111827]
              shadow-[0_25px_70px_rgba(0,0,0,0.8)]
            `
            : `
              bg-white
              shadow-[0_20px_60px_rgba(0,0,0,0.2)]
            `
        }
      `}
    >

      <h2
        className={`
          text-xl font-bold mb-2

          ${
            darkMode
              ? "text-white"
              : "text-[#3C0008]"
          }
        `}
      >
        Delete Semester
      </h2>

      <p
        className={`
          text-gray-500 dark-mode:text-gray-400 mb-6

          ${
            darkMode
              ? "text-gray-400"
              : "text-gray-500"
          }
        `}
      >
        Are you sure you want to delete all students in:
        <br />

        <span
          className={`
            font-semibold

            ${
              darkMode
                ? "text-white"
                : "text-black"
            }
          `}
        >
          {selectedTerm}
        </span>
      </p>

      <div className="flex justify-center gap-4">

        <button
          onClick={() => setShowDeleteModal(false)}
          className={`
            px-5 py-2 rounded-lg font-medium transition

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
          onClick={async () => {

            const res = await fetch(
              "http://127.0.0.1:8000/api/masterlist/delete/",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  semester: selectedTerm
                })
              }
            )

            const reload = await fetch(
              "http://127.0.0.1:8000/api/members/"
            )

            const fresh = await reload.json()

            const filtered = fresh.filter(
              m =>
                (m.semester || "").toLowerCase().trim() ===
                selectedTerm.toLowerCase().trim()
            )

            setArchives(prev => ({
              ...prev,
              [selectedTerm]: filtered
            }))

            setShowDeleteModal(false)

          }}
          className="
            px-6 py-2 rounded-xl
            bg-[#3C0008]
            hover:bg-[#5C0010]
            text-white font-medium
            transition
          "
        >
          Yes, Delete
        </button>

      </div>

    </div>

  </div>
)}

{showYearDeleteModal && (
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
              bg-[#111827]
              shadow-[0_25px_70px_rgba(0,0,0,0.8)]
            `
            : `
              bg-white
              shadow-[0_20px_60px_rgba(0,0,0,0.2)]
            `
        }
      `}
    >

      <h2
        className={`
          text-xl font-bold mb-2

          ${
            darkMode
              ? "text-white"
              : "text-[#3C0008]"
          }
        `}
      >
        Delete School Year
      </h2>

      <p
        className={`
          mb-6 text-sm

          ${
            darkMode
              ? "text-gray-400"
              : "text-gray-500"
          }
        `}
      >
        Are you sure you want to delete:
        <br />

        <span
          className={`
            font-semibold

            ${
              darkMode
                ? "text-white"
                : "text-black"
            }
          `}
        >
          {selectedYearDelete}
        </span>
      </p>

      <div className="flex justify-center gap-4">

        <button
          onClick={() => setShowYearDeleteModal(false)}
          className={`
            px-5 py-2 rounded-lg font-medium transition

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
          onClick={async () => {

            await fetch(
              "http://127.0.0.1:8000/api/schoolyears/delete/",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  year: selectedYearDelete
                    .replace("1st Semester ", "")
                    .replace("2nd Semester ", "")
                    .trim()
                })
              }
            )

            const res = await fetch(
              "http://127.0.0.1:8000/api/schoolyears/"
            )

            const data = await res.json()

            const formatted = []

            data.forEach(y => {
              formatted.push(`1st Semester ${y}`)
              formatted.push(`2nd Semester ${y}`)
            })

            setTerms(formatted)

            setShowYearDeleteModal(false)

          }}
          className="
            px-5 py-2 rounded-lg
            bg-[#5B0000]
            hover:bg-[#7A0000]
            text-white font-medium
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