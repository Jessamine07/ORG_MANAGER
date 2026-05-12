import { useState, useEffect, useRef } from "react"
import {
  Upload,
  MoreVertical,
  FileText,
  FileSpreadsheet,
  Folder,
  Search
} from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function Files({ darkMode }) {

  const navigate = useNavigate()
  const [files, setFiles] = useState([])
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedFileId, setSelectedFileId] = useState(null)
  const [selectedFileName, setSelectedFileName] = useState("")
  const [folders, setFolders] = useState([])
  const [activeFolderMenu, setActiveFolderMenu] = useState(null)
  const [showFolderModal, setShowFolderModal] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [activeFileMenu, setActiveFileMenu] = useState(null)
  const [showRenameModal, setShowRenameModal] = useState(false)
  const [renameValue, setRenameValue] = useState("")
  const deleteModalRef = useRef(null)
  const renameModalRef = useRef(null)
  const [showFolderDeleteModal, setShowFolderDeleteModal] = useState(false)
  const [showFolderRenameModal, setShowFolderRenameModal] = useState(false)
  const [selectedFolderId, setSelectedFolderId] = useState(null)
  const [selectedFolderName, setSelectedFolderName] = useState("")
  const [folderRenameValue, setFolderRenameValue] = useState("")
  const [search, setSearch] = useState("")
  

  const filteredFiles = files.filter(file =>
  file.name.toLowerCase().includes(search.toLowerCase())
)

  useEffect(() => {
  const handleClickOutside = (event) => {

    if (
      showDeleteModal &&
      deleteModalRef.current &&
      !deleteModalRef.current.contains(event.target)
    ) {
      setShowDeleteModal(false)
    }

    if (
      showRenameModal &&
      renameModalRef.current &&
      !renameModalRef.current.contains(event.target)
    ) {
      setShowRenameModal(false)
    }
  }

  document.addEventListener("mousedown", handleClickOutside)

  return () => {
    document.removeEventListener("mousedown", handleClickOutside)
  }
}, [showDeleteModal, showRenameModal])

  useEffect(() => {
  fetch("http://127.0.0.1:8000/api/files/")
    .then(res => res.json())
    .then(data => setFiles(data))
}, [])

useEffect(() => {
  fetch("http://127.0.0.1:8000/api/folders/")
    .then(res => res.json())
    .then(data => setFolders(data))
}, [])

  const handleUpload = async (e) => {
  const file = e.target.files[0]
  if (!file) return

  const formData = new FormData()
  formData.append("file", file)

  await fetch("http://127.0.0.1:8000/api/files/upload/", {
    method: "POST",
    body: formData
  })

  // 🔥 RELOAD FILES AFTER UPLOAD
  const res = await fetch("http://127.0.0.1:8000/api/files/")
  const data = await res.json()
  setFiles(data)
}

  const getIcon = (type) => {
    if (type === "pdf") return <FileText className="text-red-500"/>
    if (type === "xlsx") return <FileSpreadsheet className="text-green-600"/>
    return <FileText className="text-blue-500"/>
  }

const handleDelete = async () => {
  await fetch("http://127.0.0.1:8000/api/files/delete/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ id: selectedFileId })
  })

  // remove from UI
  setFiles(prev => prev.filter(f => f.id !== selectedFileId))

  // reset modal
  setShowDeleteModal(false)
  setSelectedFileId(null)
  setSelectedFileName("")
}


const handleRename = async (folder) => {
  const newName = prompt("Enter new folder name", folder.name)
  if (!newName) return

  await fetch("http://127.0.0.1:8000/api/folders/rename/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      id: folder.id,
      name: newName
    })
  })

  setFolders(prev =>
    prev.map(f => f.id === folder.id ? { ...f, name: newName } : f)
  )

  setActiveFolderMenu(null)
}

const handleDeleteFolder = async (id) => {
  const confirmDelete = window.confirm("Delete this folder?")
  if (!confirmDelete) return

  await fetch("http://127.0.0.1:8000/api/folders/delete/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ id })
  })

  setFolders(prev => prev.filter(f => f.id !== id))
  setActiveFolderMenu(null)
}

const handleCreateFolder = async () => {
  if (!newFolderName.trim()) return

  const res = await fetch("http://127.0.0.1:8000/api/folders/add/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ name: newFolderName })
  })

  const data = await res.json()

  setFolders(prev => [...prev, data])
  setShowFolderModal(false)
  setNewFolderName("")
}

const handleRenameFile = async () => {
  if (!renameValue.trim()) return

  await fetch("http://127.0.0.1:8000/api/files/rename/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
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
  setSelectedFileId(null)
}

const handleRenameFolder = async () => {
  if (!folderRenameValue.trim()) return

  await fetch("http://127.0.0.1:8000/api/folders/rename/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: selectedFolderId,
      name: folderRenameValue
    })
  })

  setFolders(prev =>
    prev.map(f =>
      f.id === selectedFolderId ? { ...f, name: folderRenameValue } : f
    )
  )

  setShowFolderRenameModal(false)
  setSelectedFolderId(null)
}

const handleDeleteFolderConfirm = async () => {
  await fetch("http://127.0.0.1:8000/api/folders/delete/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: selectedFolderId })
  })

  setFolders(prev => prev.filter(f => f.id !== selectedFolderId))

  setShowFolderDeleteModal(false)
  setSelectedFolderId(null)
}

  return (
    <div className="p-8 min-h-screen">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">

        <div className="flex justify-between items-start mb-6">
        <div>
          <p className="text-xs text-gray-400 mb-1">REPOSITORY</p>
          <h1 className="text-3xl font-bold text-[#3C0008]">Files & Resources</h1>
          <p className="text-gray-400 text-sm mt-2">Manage student files and resources.</p>
        </div>
      </div>
        

      </div>

<div className="flex items-center justify-between mb-6">

  {/* SEARCH */}
  <div className="relative w-[500px]">

    {/* INPUT */}
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
  className={darkMode ? "text-gray-400" : "text-[#3C0008]"}
/>

      <input
  type="text"
  placeholder="Search files..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
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
  `}
/>
    </div>

    {/* 🔥 SUGGESTION DROPDOWN */}
    {search && (
      <div className={`
absolute top-12 left-0 w-full
rounded-xl z-50 max-h-60 overflow-y-auto

${
  darkMode
    ? `
      bg-[#111827]
      shadow-[0_20px_50px_rgba(0,0,0,0.7)]
    `
    : `
      bg-white
      shadow-[0_15px_40px_rgba(0,0,0,0.18)]
    `
}
`}>

        {filteredFiles.length > 0 ? (
          filteredFiles.slice(0, 5).map(file => (
            <div
              key={file.id}
              onClick={() => {
                window.open(file.file, "_blank")
                setSearch("")
              }}
              className="px-4 py-3 text-sm cursor-pointer
              hover:bg-gray-100 dark-mode:hover:bg-[#1F2937]"
            >
              {file.name}
            </div>
          ))
        ) : (
          <p className="px-4 py-3 text-gray-400 text-sm">
            No results found
          </p>
        )}

      </div>
    )}

  </div>

  {/* BUTTONS */}
<div className="flex items-center gap-3">

 <label
  className="
    bg-gradient-to-r
    from-[#3C0008]
    to-[#5C0010]

    text-white

    px-5 py-2
    rounded-full

    text-sm
    font-semibold

    flex items-center gap-2
    cursor-pointer

    shadow-[0_10px_25px_rgba(60,0,8,0.5)]

    hover:scale-[1.03]

    transition duration-300
  "
>
    <Upload size={16}/>
    NEW FILE
    <input type="file" hidden onChange={handleUpload}/>
  </label>

  <button
    onClick={() => setShowFolderModal(true)}
  className={`
px-5 py-2
rounded-full
text-sm
font-medium
transition duration-300

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
    + Add Folder
  </button>

</div>

</div>

        <div className="col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  {folders.map(folder => (
  <div
    key={folder.id}
    className={`
relative
p-5
rounded-2xl
cursor-pointer
no-accent

transition-all duration-300

hover:scale-[1.02]

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

      shadow-[0_10px_30px_rgba(0,0,0,0.12)]
      hover:shadow-[0_15px_40px_rgba(0,0,0,0.22)]
    `
}
`}
  >

    {/* 3 DOTS BUTTON */}
    <div
      className="absolute top-3 right-3 cursor-pointer"
      onClick={(e) => {
        e.stopPropagation()
        setActiveFolderMenu(activeFolderMenu === folder.id ? null : folder.id)
      }}
    >
      ⋮
    </div>

    {/* DROPDOWN MENU */}
    {activeFolderMenu === folder.id && (
      <div
  className={`
    absolute top-10 right-3
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

        {/* RENAME */}
        <div
          onClick={() => {
  setSelectedFolderId(folder.id)
  setSelectedFolderName(folder.name)
  setFolderRenameValue(folder.name)
  setShowFolderRenameModal(true)
  setActiveFolderMenu(null)
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
          Rename
        </div>

        {/* DELETE */}
        <div
          onClick={() => {
  setSelectedFolderId(folder.id)
  setSelectedFolderName(folder.name)
  setShowFolderDeleteModal(true)
  setActiveFolderMenu(null)
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

    {/* FOLDER CONTENT */}
    <div onClick={() => navigate(`/files/${folder.id}`)}>
      <Folder/>
      <p className="font-semibold mt-3">{folder.name}</p>
      <p className="text-xs text-gray-400">Click to open</p>
    </div>

  </div>
))}

{/* FILE TABLE (UPDATED DESIGN) */}
<div className={`
col-span-3
p-6
rounded-3xl
overflow-visible
transition
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
      shadow-sm
    `
}
`}>

  {/* HEADER */}
  <div
  className={`
    grid grid-cols-[1.8fr_1fr_1fr_1fr_0.5fr]
    px-6 pt-2 pb-5
    text-sm font-bold tracking-wider
    bg-transparent

    ${darkMode ? "text-white" : "text-[#3C0008]"}
  `}
>
    <p>NAME</p>
    <p>MODIFIED</p>
    <p>SIZE</p>
    <p>OWNER</p>
    <p className="text-center">ACTION</p>
  </div>

  {/* FILE LIST */}
  {files.map((file, i) => (
    <div
      key={file.id}
      className={`
grid grid-cols-[1.8fr_1fr_1fr_1fr_0.5fr]
px-6 py-6 items-center text-sm
border-t
transition

${
  darkMode
    ? `
      border-[#2D3748]
      hover:bg-[#182234]
    `
    : `
      border-gray-200
      hover:bg-gray-50
    `
}
`}
    >

      {/* NAME */}
      <div className="flex items-center gap-3">

        {/* ICON (like screenshot) */}
        <div className="text-red-500">
          {getIcon(file?.name?.split(".").pop())}
        </div>

        {/* FILE NAME */}
        <a
  href={file.file}
  target="_blank"
 className={`
font-semibold
${darkMode ? "text-white" : "text-gray-800"}
`}
>
  {file.name}
</a>
      </div>

      {/* OTHER COLUMNS */}
      <p className={darkMode ? "text-gray-300" : "text-gray-500"}>{file.date}</p>
      <p className={darkMode ? "text-gray-300" : "text-gray-500"}>{file.size}</p>
      <p className={darkMode ? "text-gray-300" : "text-gray-500"}>{file.owner}</p>

      {/* ACTION */}
   <div className="relative flex items-center justify-center w-full">

  {/* 3 DOTS */}
  <MoreVertical
    className={`
cursor-pointer transition

${
  darkMode
    ? "text-gray-400 hover:text-white"
    : "text-gray-400 hover:text-gray-600"
}
`}
    onClick={(e) => {
      e.stopPropagation()
      setActiveFileMenu(activeFileMenu === file.id ? null : file.id)
    }}
  />

  {/* DROPDOWN MENU */}
  {activeFileMenu === file.id && (
    <div
  className={`
    absolute right-2 top-10
    w-32 rounded-lg z-50

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

      {/* RENAME */}
      <div
        onClick={() => {
          setSelectedFileId(file.id)
          setRenameValue(file.name)
          setShowRenameModal(true)
          setActiveFileMenu(null)
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
        Rename
      </div>

      {/* DELETE */}
      <div
        onClick={() => {
          setSelectedFileId(file.id)
          setSelectedFileName(file.name)
          setShowDeleteModal(true)
          setActiveFileMenu(null)
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


      </div>

      {showDeleteModal && (
  <div
    className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
    onClick={() => setShowDeleteModal(false)}
  >

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
      onClick={(e) => e.stopPropagation()}
    >
      

      {/* TITLE */}
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

      {/* MESSAGE */}
      <p className="text-gray-500 dark-mode:text-gray-400 mb-6">
        Are you sure you want to delete <br />
        <span className="font-semibold text-gray-800 dark-mode:text-white">
          {selectedFileName}?
        </span>
      </p>

      {/* BUTTONS */}
      <div className="flex justify-center gap-4">

        {/* CANCEL */}
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

        {/* DELETE */}
        <button
          onClick={handleDelete}
          className="px-5 py-2 rounded-lg bg-[#5B0000] hover:bg-[#7A0000] text-white font-medium"
        >
          Yes, Delete
        </button>

      </div>

    </div>
  </div>
)}

{showRenameModal && (
  <div
    className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
    onClick={() => setShowRenameModal(false)}
  >

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
      onClick={(e) => e.stopPropagation()}
    >

      <h2
  className={`
    text-xl font-bold mb-3

    ${
      darkMode
        ? "text-white"
        : "text-[#3C0008]"
    }
  `}
>
        Rename File
      </h2>

      <input
        value={renameValue}
        onChange={(e) => setRenameValue(e.target.value)}
        className="w-full border border-gray-300 dark-mode:border-[#374151] rounded-lg px-3 py-2 mb-5 bg-transparent text-gray-800 dark-mode:text-white"
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
          onClick={handleRenameFile}
          className="px-5 py-2 rounded-lg bg-[#3C0008] text-white"
        >
          Save
        </button>

      </div>

    </div>
  </div>
)}

{showFolderModal && (
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
    New Folder
  </h2>

  {/* INPUT */}
  <input
    type="text"
    value={newFolderName}
    onChange={(e) => setNewFolderName(e.target.value)}
    placeholder="Untitled folder"
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
      onClick={() => setShowFolderModal(false)}
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
      onClick={handleCreateFolder}
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
      Create
    </button>

  </div>

</div>

      </div>
)}

{showFolderRenameModal && (
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
    text-xl font-bold mb-3

    ${
      darkMode
        ? "text-white"
        : "text-[#3C0008]"
    }
  `}
> Folder</h2>

      <input
        value={folderRenameValue}
        onChange={(e) => setFolderRenameValue(e.target.value)}
        className="w-full border rounded-lg px-3 py-2 mb-5"
      />

      <div className="flex justify-center gap-4">

        <button
          onClick={() => setShowFolderRenameModal(false)}
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
          onClick={handleRenameFolder}
          className="px-5 py-2 rounded-lg bg-[#3C0008] text-white"
        >
          Save
        </button>

      </div>

    </div>
  </div>
)}

{showFolderDeleteModal && (
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
    text-xl font-bold mb-2

    ${
      darkMode
        ? "text-white"
        : "text-[#3C0008]"
    }
  `}
>
        Delete Folder
      </h2>

      <p className="mb-6">
        Are you sure you want to delete <br />
        <span className="font-semibold">{selectedFolderName}?</span>
      </p>

      <div className="flex justify-center gap-4">

        <button
          onClick={() => setShowFolderDeleteModal(false)}
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
          onClick={handleDeleteFolderConfirm}
          className="px-5 py-2 rounded-lg bg-[#5B0000] text-white"
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