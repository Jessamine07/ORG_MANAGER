import { useDropzone } from "react-dropzone"
import { useState, useEffect } from "react"
import {
  UploadCloud,
  Folder,
  Trash2,
  Search
} from "lucide-react"
import { X } from "lucide-react"

export default function AttendanceUpload({ darkMode }){

  const [result, setResult] = useState(null)
  const [event, setEvent] = useState("")
  const [date, setDate] = useState("")
  const [timeType, setTimeType] = useState("amIn")
  const [semester, setSemester] = useState("")
  const [files, setFiles] = useState([])
  const [searchName, setSearchName] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [searchResult, setSearchResult] = useState(null)
  const [students, setStudents] = useState([])
const [selectedStudent, setSelectedStudent] = useState(null)
const [details, setDetails] = useState([])
const [showDetailsModal, setShowDetailsModal] = useState(false)
const [selectedFile, setSelectedFile] = useState(null)
const [uploading, setUploading] = useState(false)
const [uploadSuccess, setUploadSuccess] = useState(false)
const [showFilesModal, setShowFilesModal] = useState(false)
const [currentPage, setCurrentPage] = useState(1)
const itemsPerPage = 10
const [terms, setTerms] = useState([])
const [showDeleteAllModal, setShowDeleteAllModal] = useState(false)
const [showDeleteFileModal, setShowDeleteFileModal] = useState(false)
const [selectedDeleteFile, setSelectedDeleteFile] = useState(null)



 const uploadFile = async () => {
  if (!selectedFile) {
    alert("Please select a file first")
    return
  }

  setUploading(true)
  setUploadSuccess(false)

  const formData = new FormData()
  formData.append("file", selectedFile)
  formData.append("event", event)
  formData.append("date", date)
  formData.append("time", timeType)
  formData.append("semester", semester)

  const response = await fetch("http://127.0.0.1:8000/api/upload/", {
    method: "POST",
    body: formData
  })

  const data = await response.json()

  setResult(data)
  setUploading(false)
  setUploadSuccess(true)

  // ✅ REFRESH FILES
  const filesRes = await fetch(`http://127.0.0.1:8000/api/attendance/files/?semester=${semester}`)
  const filesData = await filesRes.json()
  setFiles(filesData)

  // ✅ REFRESH STUDENTS (THIS FIXES YOUR PROBLEM)
  const summaryRes = await fetch(`http://127.0.0.1:8000/api/attendance/summary/?semester=${semester}`)
  const summaryData = await summaryRes.json()
  setStudents(summaryData)
}

  const {getRootProps, getInputProps} = useDropzone({
    onDrop: (acceptedFiles) => {
  setSelectedFile(acceptedFiles[0])
}
  })

  const filteredStudents = students.filter((s) =>
  s.name.toLowerCase().includes(searchName.toLowerCase())
)

const totalStudents = filteredStudents.length

const indexOfLast = currentPage * itemsPerPage
const indexOfFirst = indexOfLast - itemsPerPage

const currentStudents = filteredStudents.slice(indexOfFirst, indexOfLast)

const totalPages = Math.ceil(totalStudents / itemsPerPage)

  useEffect(() => {
    if (!semester) return

    fetch(`http://127.0.0.1:8000/api/attendance/files/?semester=${semester}`)
      .then(res => res.json())
      .then(data => setFiles(data))

  }, [semester])

  useEffect(() => {
  if (!semester) return

  fetch(`http://127.0.0.1:8000/api/attendance/summary/?semester=${semester}`)
    .then(res => res.json())
    .then(data => setStudents(data))

}, [semester])

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

      // 🔥 ADD THIS
      const saved = localStorage.getItem("selectedTerm")

      if (saved && formatted.includes(saved)) {
        setSemester(saved)
      } else if (formatted.length > 0) {
        setSemester(formatted[0])
      }
    })
}, [])


  return(

    <div className="p-8 min-h-screen">

      <div className="flex justify-between items-start mb-6">
        <div>
          <p className="text-xs text-gray-400 mb-1">STUDENTS SANCTION</p>
         <h1
  className={`
    text-3xl font-bold
    ${
      darkMode
        ? "text-white"
        : "text-[#3C0008]"
    }
  `}
>Attendance Upload</h1>
          <p className="text-gray-400 text-sm mt-2">Where you see students absences and attendance records.</p>
        </div>
      </div>

      {/* 🔥 TOP BAR */}
      <div className="flex justify-between mb-6">

      <div className="relative w-[500px]">

  <div
    className={`
      flex items-center
      px-5 py-3
      rounded-full
      transition

      w-[600px]

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
      placeholder="Search student..."
      value={searchName}
      onChange={(e) => setSearchName(e.target.value)}
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

        <div className="flex items-center gap-3">

  {/* 🔥 ADD EVENT ICON */}
  <button
  onClick={() => setShowModal(true)}
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
">

  <div className="flex items-center gap-2">
  <UploadCloud size={16} />
  <span>UPLOAD ATTENDANCE</span>
</div>

</button>

  {/* 🔥 UPLOADED FILES ICON */}
  <button
    onClick={() => setShowFilesModal(true)}
    className={`
  w-12 h-12
  flex items-center justify-center
  rounded-full
  transition

  ${
    darkMode
      ? `
        bg-[linear-gradient(135deg,#1F2937_0%,#111827_100%)]
        border border-[#374151]
        shadow-[0_10px_30px_rgba(0,0,0,0.5)]
        hover:scale-105
      `
      : `
        bg-white
        border border-gray-200
        shadow-sm
        hover:bg-gray-100
      `
  }
`}
  >
    <Folder size={20} className={
  darkMode
    ? "text-white"
    : "text-[#3C0008]"
} />
  </button>

  {/* 🔥 DELETE ALL ICON */}
<button
  onClick={() => setShowDeleteAllModal(true)}
  className={`
  w-12 h-12
  flex items-center justify-center
  rounded-full
  transition

  ${
    darkMode
      ? `
        bg-[linear-gradient(135deg,#1F2937_0%,#111827_100%)]
        border border-[#374151]
        shadow-[0_10px_30px_rgba(0,0,0,0.5)]
        hover:scale-105
      `
      : `
        bg-white
        border border-gray-200
        shadow-sm
        hover:bg-gray-100
      `
  }
`}
  title="Delete All Files"
>
  <Trash2 size={20} className={
  darkMode
    ? "text-white"
    : "text-[#3C0008]"
} />
</button>

</div>

      </div>

      {/* 🔥 RESULT TABLE */}
      {students.length > 0 && (
       <div
 className={`
  no-accent
  rounded-3xl
  p-10
  text-center
  transition duration-300

  ${
    darkMode
      ? `
        bg-gradient-to-br
        from-[#1F2937]
        to-[#111827]

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
`}
>

  {/* HEADER */}
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
    <p>NAME</p>
    <p>YEAR</p>
    <p>ABSENCES</p>
    <p>MEMBERSHIP</p>
    <p>ACTION</p>
  </div>

  {/* ROWS */}
  {currentStudents.map((s) => (

      <div
  key={s.id}
 className={`
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
        hover:bg-[#FFF5F5]
        text-gray-600
      `
  }
`}
>

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
  {s.name}
</p>

        <p>{s.year}</p>

        <p className="text-red-600 font-semibold">
          {s.absences}
        </p>

        <p
  className={
    s.membership === "PAID"
      ? "text-green-600"
      : "text-red-500"
  }
>
  {s.membership}
</p>

        <button
          onClick={async () => {
            const res = await fetch(`http://127.0.0.1:8000/api/attendance/details/${s.id}/?semester=${semester}`)
            const data = await res.json()

            setDetails(data)
            setSelectedStudent(s)
            setShowDetailsModal(true)
          }}
          className="text-gray-400 hover:text-[#3C0008]"
        >
          View
        </button>

      </div>
  ))}

</div>
      )}

      <div className="flex justify-between items-center mt-4 px-2">

  {/* LEFT TEXT */}
  <p className="text-sm text-gray-500">
    Showing {indexOfFirst + 1} to {Math.min(indexOfLast, totalStudents)} of {totalStudents} entries
  </p>

  {/* PAGINATION BUTTONS */}
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


      {/* 🔥 MODAL */}
      {showModal && (
        <div
 className="
  fixed inset-0
  z-[9999]
  bg-black/40
  flex items-center justify-center
"
>

          <div
  className={`
    w-[430px]
    rounded-3xl
    p-8
    transition

    ${
      darkMode
        ? `
          bg-[#111827]
          shadow-[0_25px_70px_rgba(0,0,0,0.8)]
        `
        : `
          bg-white
          shadow-[0_20px_60px_rgba(0,0,0,0.25)]
        `
    }
  `}
>

            <div className="flex justify-between items-center mb-4">
  <h2
  className={`
    text-2xl font-bold

    ${
      darkMode
        ? "text-white"
        : "text-[#3C0008]"
    }
  `}
>
    Upload Attendance
  </h2>

  <button
    onClick={() => setShowModal(false)}
    className={`
  p-2 rounded-full transition

  ${
    darkMode
      ? `
        hover:bg-[#1F2937]
        text-white
      `
      : `
        hover:bg-gray-200
        text-[#3C0008]
      `
  }
`}
  >
    <X size={20} />
  </button>
</div>

            <input
              type="text"
              placeholder="Event Name"
              value={event}
              onChange={(e) => setEvent(e.target.value)}
             className={`
  w-full
  px-5 py-3
  rounded-2xl
  mb-4
  outline-none
  transition

  ${
    darkMode
      ? `
        bg-[#0F172A]
        border border-[#374151]
        text-white
        placeholder:text-gray-400
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
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={`
  w-full
  px-5 py-3
  rounded-2xl
  mb-4
  outline-none
  transition

  ${
    darkMode
      ? `
        bg-[#0F172A]
        border border-[#374151]
        text-white
        placeholder:text-gray-400
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

            <select
              value={timeType}
              onChange={(e) => setTimeType(e.target.value)}
              className={`
  w-full
  px-5 py-3
  rounded-2xl
  mb-4
  outline-none
  transition

  ${
    darkMode
      ? `
        bg-[#0F172A]
        border border-[#374151]
        text-white
      `
      : `
       bg-gray-200
border border-gray-300
text-[#3C0008]
placeholder-gray-500
      `
  }
`}
            >
              <option value="amIn">AM IN</option>
              <option value="amOut">AM OUT</option>
              <option value="pmIn">PM IN</option>
              <option value="pmOut">PM OUT</option>
            </select>

            <div
  {...getRootProps()}
  className={`
  border-2 border-dashed
  p-8
  rounded-2xl
  text-center
  cursor-pointer
  mb-4
  transition

  ${
    darkMode
      ? `
        border-[#374151]
        bg-[#0F172A]
        hover:bg-[#1F2937]
      `
      : `
        border-gray-300
        hover:bg-gray-50
      `
  }
`}
>
  <input {...getInputProps()} />

  {!selectedFile && (
    <p className="text-gray-400">Click or drag Excel file here</p>
  )}

  {selectedFile && (
    <p className="text-green-600 font-semibold">
      Selected: {selectedFile.name}
    </p>
  )}
</div>

<button
  onClick={uploadFile}
  className="
  w-full
  mt-2
  py-3
  rounded-2xl
  bg-[#3C0008]
  hover:bg-[#5C0010]
  text-white
  font-semibold
  transition
"
>
  {uploading ? "Uploading..." : "Upload File"}
</button>

{uploadSuccess && (
  <p className="text-green-600 text-sm text-center">
    ✅ File successfully processed!
  </p>
)}


          </div>

        </div>
      )}

      {showDetailsModal && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

   <div
  className={`
    relative
    w-[550px]
    max-h-[80vh]
    overflow-y-auto
    rounded-3xl
    p-8
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

<button
  onClick={() => setShowDetailsModal(false)}
  className={`
    absolute top-5 right-5
    text-2xl font-bold
    transition z-50

    ${
      darkMode
        ? "text-gray-400 hover:text-white"
        : "text-gray-500 hover:text-black"
    }
  `}
>
  ×
</button>

      <h2 className={`
  text-xl
  font-bold

  ${
    darkMode
      ? "text-[#7A0000]"
      : "text-[#3C0008]"
  }
`}>
        {selectedStudent?.name} 
      </h2>

     {/* 🔥 HEADER */}
<div
  className={`
    grid grid-cols-5
    items-center
    py-3
    mb-3
    text-sm
    font-semibold

    ${
      darkMode
        ? "text-white"
        : "text-black"
    }
  `}
>
  <span>Event</span>
  <span>Date</span>
  <span>Time</span>
  <span>Status</span>
  <span></span>
</div>


{details.map((d, i) => (
  <div
    key={i}
    className={`
      grid grid-cols-5
      items-center
      py-3
      text-sm

      ${
        darkMode
          ? "text-white"
          : "text-black"
      }
    `}
  >
    
    <span>{d.event}</span>

<span className="text-gray-500">
      {new Date(d.date).toLocaleDateString()}
    </span>

    <span>{d.time}</span>

    <span className="text-red-500">{d.status}</span>


    {/* 🔥 DELETE BUTTON */}
    <button
      onClick={async () => {
        const confirmDelete = confirm("Delete this attendance record?")
        if (!confirmDelete) return

        await fetch("http://127.0.0.1:8000/api/attendance/delete/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            student_id: selectedStudent.id,
            event: d.event,
            date: d.date,
            time: d.time
          })
        })

        // 🔥 REFRESH DETAILS
        const res = await fetch(
  `http://127.0.0.1:8000/api/attendance/details/${selectedStudent.id}/?semester=${semester}`
)
        const newData = await res.json()
        setDetails(newData)

        // 🔥 REFRESH TABLE (VERY IMPORTANT)
        const summary = await fetch(`http://127.0.0.1:8000/api/attendance/summary/?semester=${semester}`)
        const summaryData = await summary.json()
        setStudents(summaryData)
      }}
      className="
  w-fit
  px-3 py-1.5
  rounded-lg
  bg-[#3C0008]
  hover:bg-[#5A000C]
  text-white
  text-sm
  font-medium
  transition
"
    >
      Delete
    </button>

  </div>
))}


    </div>

  </div>
)}

{showFilesModal && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

    <div
  className={`
    w-[480px]
    max-h-[80vh]
    overflow-y-auto
    rounded-3xl
    p-6
    transition

    ${
      darkMode
        ? `
          bg-[#111827]
border border-[#1F2937]
shadow-[0_25px_70px_rgba(0,0,0,0.8)]
        `
        : `
          bg-white
          shadow-[0_20px_60px_rgba(0,0,0,0.2)]
        `
    }
  `}
>

  

      <div className="flex justify-between items-center mb-6">
  <h2
  className={`
    text-xl font-bold

    ${
      darkMode
        ? "text-white"
        : "text-[#3C0008]"
    }
  `}
>
    Uploaded Attendance Files
  </h2>

  <button
    onClick={() => setShowFilesModal(false)}
   className={`
  p-2 rounded-full transition

  ${
    darkMode
      ? `
        hover:bg-[#1F2937]
        text-white
      `
      : `
        hover:bg-gray-200
        text-[#3C0008]
      `
  }
`}
  >
    <X size={18} />
  </button>
</div>

      {files.length === 0 && (
        <p className="text-gray-400 text-sm">No uploads yet</p>
      )}

      {files.map((f) => (
        <div
  key={f.id}
  className={`
    py-3
    flex justify-between items-center
    border-b
    transition

    ${
      darkMode
        ? `
          border-[#374151]
        `
        : `
          border-gray-200
        `
    }
  `}
>

          <div>
            <p
  className={`
    font-semibold text-lg

    ${
      darkMode
        ? "text-white"
        : "text-gray-800"
    }
  `}
>
  {f.name}
</p>
            <p className={`
  text-sm mt-1

  ${
    darkMode
      ? "text-gray-400"
      : "text-gray-500"
  }
`}>
              {f.event} | {f.date} | {f.time_type}
            </p>
          </div>

          {/* 🔥 DELETE BUTTON */}
          <button
            onClick={() => {
  setSelectedDeleteFile(f)
  setShowDeleteFileModal(true)
}}

            className="
  px-5 py-2
  rounded-xl
  bg-[#3C0008]
  hover:bg-[#5C0010]
  text-white
  text-sm
  font-medium
  transition
"
          >
            Delete
          </button>

        </div>
      ))}

    </div>

  </div>
)}

{showDeleteAllModal && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

    <div
  className={`
    w-[430px]
    rounded-3xl
    p-8
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
    text-2xl font-bold mb-4

    ${
      darkMode
        ? "text-white"
        : "text-[#3C0008]"
    }
  `}
>
        Delete All Attendance Files?
      </h2>

      <p className={`
  text-sm mb-8 leading-relaxed

  ${
    darkMode
      ? "text-gray-400"
      : "text-gray-500"
  }
`}>
        This will remove ALL uploaded attendance files and reset all absences.
      </p>

      <div className="flex justify-center gap-4">

        {/* CANCEL */}
        <button
          onClick={() => setShowDeleteAllModal(false)}
          className={`
  px-6 py-3
  rounded-2xl
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

        {/* CONFIRM DELETE */}
        <button
          onClick={async () => {

            await fetch("http://127.0.0.1:8000/api/attendance/delete-all/", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    semester: semester   // 🔥 REQUIRED
  })
})

            // 🔥 CLEAR UI
            setFiles([])
            setStudents([])
            setDetails([])
            setSelectedStudent(null)

            // 🔥 REFRESH DATA
            const summary = await fetch(`http://127.0.0.1:8000/api/attendance/summary/?semester=${semester}`)
            const summaryData = await summary.json()
            setStudents(summaryData)

            setShowDeleteAllModal(false)

          }}
          className="
  px-6 py-3
  rounded-2xl
  bg-[#3C0008]
  hover:bg-[#5C0010]
  text-white
  font-medium
  transition
"
        >
          Delete All
        </button>

      </div>

    </div>

  </div>
)}

{showDeleteFileModal && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

    <div
      className={`
        w-[350px]
        rounded-2xl
        p-6
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
        Delete File
      </h2>

      <p
        className={`
          text-sm mb-6

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
          {selectedDeleteFile?.name}
        </span>
      </p>

      <div className="flex justify-center gap-4">

        <button
          onClick={() => setShowDeleteFileModal(false)}
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
              "http://127.0.0.1:8000/api/attendance/file/delete/",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  id: selectedDeleteFile.id
                })
              }
            )

            const res = await fetch(
              `http://127.0.0.1:8000/api/attendance/files/?semester=${semester}`
            )

            const data = await res.json()

            setFiles(data)

            const summary = await fetch(
              `http://127.0.0.1:8000/api/attendance/summary/?semester=${semester}`
            )

            const summaryData = await summary.json()

            setStudents(summaryData)

            setShowDeleteFileModal(false)

          }}
          className="
            px-5 py-2 rounded-lg
            bg-[#3C0008]
            hover:bg-[#5C0010]
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

