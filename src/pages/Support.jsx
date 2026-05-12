import { useState } from "react"

export default function Support({ darkMode }) {

  const [openFAQ, setOpenFAQ] = useState(null)
  const [selectedGuide, setSelectedGuide] = useState(null)
  const [supportImage, setSupportImage] = useState(
  localStorage.getItem("supportImage") || null
)

  return (
    <div
  className={`
    p-8 min-h-screen

    ${
      darkMode
        ? "bg-[#0B0F19]"
        : "bg-[#F5F5F5]"
    }
  `}
>

      {/* TOP SECTION */}
      <div className="grid grid-cols-2 gap-8 mb-10">

        <div>
          <p className="text-xs text-gray-400 tracking-widest mb-2">
            INSTITUTIONAL STATEMENT
          </p>

          <h1
  className={`
    text-3xl font-bold mb-4

    ${
      darkMode
        ? "text-white"
        : "text-[#3C0008]"
    }
  `}
>
            Help & Information Center
          </h1>

          <p
  className={`
    text-sm leading-relaxed mb-4

    ${
      darkMode
        ? "text-gray-400"
        : "text-gray-500"
    }
  `}
>
            The Officer Portal stands as the definitive digital infrastructure
            for the Student Officer Organization. Our mission is to modernize
            student organization management, centralize officer resources,
            and enhance institutional transparency through a secure, unified environment.
          </p>

          <div className="flex gap-3 text-xs">
           <span
  className={`
    px-3 py-1 rounded-full text-xs

    ${
      darkMode
        ? `
          bg-[#111827]
          border border-[#374151]
          text-white
        `
        : `
          bg-gray-200
          text-[#3C0008]
        `
    }
  `}
>
              AUTHORITY LEVEL: ADMIN
            </span>
            <span
  className={`
    px-3 py-1 rounded-full text-xs

    ${
      darkMode
        ? `
          bg-[#111827]
          border border-[#374151]
          text-white
        `
        : `
          bg-gray-200
          text-[#3C0008]
        `
    }
  `}
>
              SECURE GRADE ACCESS
            </span>
          </div>
        </div>

        {/* IMAGE */}
        <label
  className="
  no-accent
    ${
  darkMode
    ? `
      bg-gradient-to-br from-[#1F2937] to-[#111827]
      border border-[#374151]
    `
    : `
      bg-gray-300
    `
}
    rounded-2xl
    h-52
    overflow-hidden
    cursor-pointer
    flex items-center justify-center
    relative
    group
  "
>

  {/* IMAGE PREVIEW */}
  {supportImage ? (

    <img
      src={supportImage}
      alt="Support Preview"
      className="
        w-full h-full
        object-cover
      "
    />

  ) : (

    <div className="text-center">

      <p className="text-sm text-gray-500 dark-mode:text-gray-400">
        Click to upload image
      </p>

    </div>

  )}

  {/* DARK OVERLAY */}
  <div
    className="
      absolute inset-0
      bg-black/0
      group-hover:bg-black/20
      transition duration-300
    "
  />

  {/* HIDDEN INPUT */}
  <input
    type="file"
    accept="image/*"
    className="hidden"

    onChange={(e) => {

      const file = e.target.files[0]

      if (!file) return

      const reader = new FileReader()

reader.onloadend = () => {

  localStorage.setItem(
    "supportImage",
    reader.result
  )

  setSupportImage(reader.result)

}

reader.readAsDataURL(file)

    }}
  />

</label>

      </div>

      {/* USER GUIDES */}
      <div className="mb-10">

        <h2 className="text-sm font-bold text-[#5A000C] mb-4">
          USER GUIDES
        </h2>

        <div className="grid grid-cols-4 gap-6">

          {[
  {
    title: "Student Masterlist",
    description:
      "The Student Masterlist module allows officers to upload and manage official student records per semester and academic year. Upload Excel or PDF masterlists to automatically populate student data, including names, course, year level, and status. The system synchronizes these records with Attendance Tracking and Membership Management."
  },

  {
    title: "Events Calendar",
    description:
      "The Events Calendar module centralizes organization scheduling. Officers may create, edit, and manage upcoming institutional activities, meetings, and organization events. Events automatically appear on the calendar dashboard and are synchronized with attendance uploads and event tracking."
  },

  {
    title: "Attendance Tracking",
    description:
      "The Attendance Tracking system enables officers to upload attendance spreadsheets and monitor student participation records. Attendance summaries, absences, and attendance history are automatically generated based on the selected semester and uploaded event files."
  },

  {
    title: "File Repository",
    description:
      "The File Repository serves as the centralized storage environment for organizational resources, documentation, and official files. Officers may organize folders, upload files, and maintain categorized institutional records for easier retrieval and long-term accessibility."
  }
].map((guide, i) => (
            <div
  key={i}
  onClick={() => setSelectedGuide(guide)}
            className={`
                no-accent
  p-5 rounded-2xl
  cursor-pointer
  transition-all duration-300
  hover:-translate-y-1

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
`}>
              <p className={`
  font-semibold mb-2

  ${
    darkMode
      ? "text-white"
      : "text-[#3C0008]"
  }
`}>
  {guide.title}
</p>
              <p className="text-xs text-gray-400 mb-3">
                View guide →
              </p>
            </div>
          ))}

        </div>

      </div>

      {/* LOWER SECTION */}
      <div className="grid grid-cols-2 gap-8">

        {/* FAQ */}
        <div
  className={`
    no-accent
    p-6 rounded-2xl transition

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
          shadow-sm
        `
    }
  `}
>

         <h3 className="font-bold text-[#5A000C] mb-4">
            FAQ SECTION
          </h3>

          {[
  {
    question: "How do I request portal access?",
    answer:
      "Students and officers can request access by contacting the ITS administrator or registering using their official school email."
  },


  {
    question: "What features are available in ITSConnect?",
    answer:
      "ITSConnect provides organization announcements, member management, event tracking, attendance monitoring, and profile management.."
  },

  {
    question: "Who can access the system?",
    answer:
      "Only authorized students, officers, advisers, and administrators with registered accounts can access the portal."
  }

].map((faq, i) => (
            <div
  key={i} className="mb-4">

              <div
                onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
               className={`
  flex justify-between
  cursor-pointer
  text-sm

  ${
    darkMode
      ? "text-white"
      : "text-black"
  }
`}
              >
                {faq.question}
                <span>▼</span>
              </div>

              {openFAQ === i && (
                <p className="text-xs text-gray-400 mt-2">
                  {faq.answer}
                </p>
                
              )}

            </div>
          ))}

        </div>


      </div>

      {selectedGuide && (

  <div
    className="
      fixed inset-0
      bg-black/40
      flex items-center justify-center
      z-50
    "

    onClick={() => setSelectedGuide(null)}
  >

   
  <div
  className={`
    no-accent
    w-[520px]
    rounded-3xl
    px-8 py-7
    transition-all duration-300
    shadow-[0_25px_70px_rgba(0,0,0,0.45)]

    ${
      darkMode
        ? `
          bg-[linear-gradient(135deg,#1F2937_0%,#111827_100%)]
          border border-[#374151]
        `
        : `
          bg-white
        `
    }
  `}

      onClick={(e) => e.stopPropagation()}
    >

      {/* TITLE */}
      <h2 className="
  text-2xl font-bold
  text-[#3C0008]
  dark-mode:text-white
  mb-6
  leading-tight
">
        {selectedGuide.title}
      </h2>

      {/* DESCRIPTION */}
      <p className="
  text-[15px]
leading-8
  text-gray-500
  dark-mode:text-gray-400
  leading-10
  mb-8
">
        {selectedGuide.description}
      </p>

      {/* BUTTON */}
      <button
        onClick={() => setSelectedGuide(null)}
        className="
  w-full py-3
  rounded-2xl
          bg-[#3C0008]
          text-white
          hover:bg-[#5C0010]
          transition
        "
      >
        Close Guide
      </button>

    </div>

  </div>

)}

    </div>
  )
}