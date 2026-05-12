import { useEffect, useState, useRef } from "react"
import { useParams, useLocation } from "react-router-dom"


export default function FolderFiles({ darkMode }) {

  const { id } = useParams()
  const [files, setFiles] = useState([])
  const [folderName, setFolderName] = useState("")

  const [activeFileMenu, setActiveFileMenu] = useState(null)
const [showRenameModal, setShowRenameModal] = useState(false)
const [showDeleteModal, setShowDeleteModal] = useState(false)
const [selectedFileId, setSelectedFileId] = useState(null)
const [renameValue, setRenameValue] = useState("")
const fileInputRef = useRef(null)
const location = useLocation()
const [selectedUpload, setSelectedUpload] = useState(null)

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/files/${id}/`)
      .then(res => res.json())
      .then(data => setFiles(data))
  }, [id])

  useEffect(() => {

  fetch(`http://127.0.0.1:8000/api/folders/`)
    .then(res => res.json())
    .then(data => {

      const currentFolder = data.find(
        folder => folder.id == id
      )

      if (currentFolder) {
        setFolderName(currentFolder.name)
      }

    })

}, [id])

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append("file", file)
    formData.append("folder_id", id)

    await fetch("http://127.0.0.1:8000/api/files/upload/", {
      method: "POST",
      body: formData
    })

    const res = await fetch(`http://127.0.0.1:8000/api/files/${id}/`)
    const data = await res.json()
    setFiles(data)
  }

  const handleRename = async () => {
  await fetch("http://127.0.0.1:8000/api/files/rename/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: selectedFileId,
      name: renameValue
    })
  })

  setFiles(prev =>
    prev.map(f =>
      f.id === selectedFileId ? { ...f, name: renameValue } : f
    )
  )

  setShowRenameModal(false)
}

const handleDelete = async () => {
  await fetch("http://127.0.0.1:8000/api/files/delete/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: selectedFileId })
  })

  setFiles(prev => prev.filter(f => f.id !== selectedFileId))
  setShowDeleteModal(false)
}

const handleDrop = async (e) => {
  e.preventDefault()

  const file = e.dataTransfer.files[0]
  if (!file) return

  const formData = new FormData()
  formData.append("file", file)
  formData.append("folder_id", id)

  await fetch("http://127.0.0.1:8000/api/files/upload/", {
    method: "POST",
    body: formData
  })

  const res = await fetch(`http://127.0.0.1:8000/api/files/${id}/`)
  const data = await res.json()
  setFiles(data)
}

const handleDragOver = (e) => {
  e.preventDefault()
}

  return (
  <div className="p-8 min-h-screen">

    

    {/* HEADER */}
    {/* 🔥 BREADCRUMB HEADER */}
<div className="mb-6">

  {/* 🔥 HEADER (MATCH FILES PAGE UI) */}
<div className="mb-6">

  {/* SMALL LABEL */}
  <p className="text-xs tracking-widest text-gray-400 uppercase mb-1">
    Repository
  </p>

  {/* MAIN TITLE / BREADCRUMB */}
<h1
  className={`
    text-2xl font-bold

    ${
      darkMode
        ? "text-white"
        : "text-[#3C0008]"
    }
  `}
>

    <span
      className="cursor-pointer hover:text-[#3C0008] transition"
      onClick={() => window.location.href = "/files"}
    >
      Files & Resources
    </span>

    <span className="mx-2 text-gray-400">›</span>

    <span className="text-[#3C0008]">
      {folderName}
    </span>

  </h1>

</div>

</div>

    <div className="grid grid-cols-3 gap-6 items-start">

      {/* 🔥 LEFT PANEL (UPLOAD CARD) */}
     <div
  className={`
    p-6 rounded-2xl no-accent

    ${
      darkMode
        ? `
          bg-gradient-to-br from-[#1F2937] to-[#111827]
          text-white
          border border-[#3C0008]/40
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

        <h2 className="font-semibold text-lg mb-2 dark-mode:text-white">
          New Upload
        </h2>
        <p className="text-sm text-gray-400 mb-4">
          Add documents to the repository.
        </p>

        {/* DROP AREA */}
        <div
  onClick={() => fileInputRef.current.click()}   // ✅ ADD THIS
  onDrop={handleDrop}
  onDragOver={handleDragOver}
  className="
    border-2 border-dashed border-[#3C0008]/30
    rounded-xl p-10 text-center mb-4
    cursor-pointer
  "
>
          <p className="text-gray-500">Drop files here</p>
          <p className="text-xs text-gray-400 mt-1">
            PDF, DOCX, XLSX
          </p>

          {selectedUpload && (
  <p className="mt-3 text-sm font-medium text-[#3C0008]">
    {selectedUpload.name}
  </p>
)}
        </div>

        {/* FILE INPUT */}
    <input
  type="file"
  ref={fileInputRef}

  onChange={(e) => {
    const file = e.target.files[0]

    if (!file) return

    setSelectedUpload(file)
  }}

  className="hidden"
/>

        {/* BUTTON */}
        <button

  onClick={async () => {

    if (!selectedUpload) return

    const formData = new FormData()

    formData.append("file", selectedUpload)
    formData.append("folder_id", id)

    await fetch(
      "http://127.0.0.1:8000/api/files/upload/",
      {
        method: "POST",
        body: formData
      }
    )

    const res = await fetch(
      `http://127.0.0.1:8000/api/files/${id}/`
    )

    const data = await res.json()

    setFiles(data)

    setSelectedUpload(null)

  }}

  className="
    w-full

    bg-[#3C0008]
    hover:bg-[#5B0000]

    text-white

    py-3 rounded-xl

    transition
  "
>
  Process Upload
</button>



      </div>

      {/* 🔥 RIGHT PANEL */}
      <div className="col-span-2 space-y-4">

        <h2
  className={`
    font-semibold text-lg

    ${
      darkMode
        ? "text-white"
        : "text-[#3C0008]"
    }
  `}
>
          Organization Repository
        </h2>

        {/* FILE LIST */}
        
        {files.map(file => (
          <div
            key={file.id}
            className={`
flex items-center justify-between
p-5 rounded-2xl
transition duration-300
no-accent

${
  darkMode
    ? `
      bg-gradient-to-br from-[#1F2937] to-[#111827]
      text-white
      border border-[#3C0008]/40
      shadow-[0_15px_40px_rgba(0,0,0,0.7)]
      hover:shadow-[0_20px_50px_rgba(0,0,0,0.9)]
    `
    : `
      bg-white
      text-gray-700
      border border-gray-200
      shadow-[0_10px_30px_rgba(0,0,0,0.08)]
      hover:shadow-[0_15px_40px_rgba(0,0,0,0.18)]
    `
}
`}
          >

            {/* LEFT */}
            <div className="flex items-center gap-4">

              {/* ICON */}
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100">
                📄
              </div>

              {/* INFO */}
              <div>
                <a
  href={file.file}
  target="_blank"
 className={`
font-semibold hover:underline cursor-pointer

${
  darkMode
    ? "text-white"
    : "text-gray-800"
}
`}
>
  {file.name}
</a>
                <p className="text-xs text-gray-400">
                  {file.size} • {file.date}
                </p>
              </div>

            </div>

            {/* ACTION */}
            <div className="relative">
  <button
    onClick={() =>
      setActiveFileMenu(activeFileMenu === file.id ? null : file.id)
    }
    className={`
text-xl transition

${
  darkMode
    ? "text-gray-400 hover:text-white"
    : "text-gray-400 hover:text-black"
}
`}
  >
    ⋮
  </button>

  {activeFileMenu === file.id && (
    <div
  className={`
    absolute right-0 mt-2 w-36 z-50 rounded-lg

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
  `}
>

      <button
        onClick={() => {
          setSelectedFileId(file.id)
          setRenameValue(file.name)
          setShowRenameModal(true)
          setActiveFileMenu(null)
        }}
       className={`
block w-full text-left px-4 py-2 text-sm transition

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
        Rename
      </button>

      <button
        onClick={() => {
          setSelectedFileId(file.id)
          setShowDeleteModal(true)
          setActiveFileMenu(null)
        }}
        className={`
block w-full text-left px-4 py-2 text-sm transition

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
      </button>

    </div>
  )}
</div>

          </div>
        ))}

        

      </div>

    </div>

    {showRenameModal && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

    <div className={`
rounded-2xl p-6 w-[350px] text-center

${
  darkMode
    ? `
      bg-[#111827]
      shadow-[0_20px_50px_rgba(0,0,0,0.7)]
    `
    : `
      bg-white
      shadow-[0_20px_50px_rgba(0,0,0,0.2)]
    `
}
`}>

      <h2
  className={`
    text-xl font-bold mb-3

    ${
      darkMode
        ? "text-white"
        : "text-[#3C0008]"
    }
  `}
>Rename File</h2>

      <input
        value={renameValue}
        onChange={(e) => setRenameValue(e.target.value)}
        className="w-full border rounded-lg px-3 py-2 mb-5"
      />

      <div className="flex justify-center gap-4">
        <button
          onClick={() => setShowRenameModal(false)}
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
      text-[#3C0008]
      hover:bg-gray-300
    `
}
`}
        >
          Cancel
        </button>

        <button
          onClick={handleRename}
          className="px-5 py-2 bg-[#3C0008] text-white rounded-lg"
        >
          Save
        </button>
      </div>

    </div>
  </div>
)}

{showDeleteModal && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

    <div className="bg-white rounded-2xl p-6 w-[350px] text-center shadow-xl">

     <h2
  className={`
    text-xl font-bold mb-2

    ${
      darkMode
        ? "text-white"
        : "text-[#3C0008]"
    }
  `}
> Delete File?</h2>

      <p className="mb-6">Are you sure you want to delete this file?</p>

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
      text-[#3C0008]
      hover:bg-gray-300
    `
}
`}
        >
          Cancel
        </button>

        <button
          onClick={handleDelete}
          className="px-5 py-2 bg-[#5B0000] text-white rounded-lg"
        >
          Yes, Delete
        </button>
      </div>

    </div>
  </div>
)}

  </div>
)
}