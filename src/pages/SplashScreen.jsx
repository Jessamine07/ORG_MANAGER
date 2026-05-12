import { useEffect, useState } from "react"

export default function SplashScreen() {

  const [progress, setProgress] = useState(0)

  useEffect(() => {

    const interval = setInterval(() => {

      setProgress(prev => {

        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }

        // RANDOM REALISTIC LOADING
        const increment = Math.floor(Math.random() * 12) + 3

        return Math.min(prev + increment, 100)

      })

    }, 120)

    return () => clearInterval(interval)

  }, [])

  return (

    <div className="
      fixed inset-0
      z-[99999]

      bg-[#F8F8F8]

      flex flex-col
      items-center
      justify-center
    ">

     <div
  className="
    w-32 h-32
    rounded-full
    overflow-hidden

    border-[6px]
    border-white

    shadow-[0_15px_40px_rgba(60,0,8,0.35)]
  "
>

  <img
    src="/logosvg.png"
    alt="ITSConnect Logo"

    className="
      w-full
      h-full
      object-cover
    "
  />

</div>

      {/* TITLE */}
      <h1 className="
        mt-8
        text-5xl
        font-black
        leading-none
        text-center
        text-[#1F1F1F]
      ">
        ITS OFFICER
        <br />
        PORTAL
      </h1>

      <p className="
        mt-4
        text-sm
        tracking-[4px]
        text-[#3C0008]
      ">
        INFORMATION TECHNOLOGY SOCIETY 
      </p>

      {/* LOADING BAR */}
      <div className="mt-10 w-[240px]">

        <div className="
          h-2
          rounded-full
          bg-gray-200
          overflow-hidden
        ">

          <div
            className="
              h-full
              bg-[#3C0008]
              rounded-full
              transition-all duration-200
            "
            style={{
              width: `${progress}%`
            }}
          />

        </div>

        {/* PERCENTAGE */}
        <div className="
          flex justify-between
          mt-2
          text-[11px]
          text-gray-500
          font-semibold
        ">
          <span>INITIALIZING SYSTEM...</span>

          <span>{progress}%</span>
        </div>

      </div>

      {/* FOOTER */}
      <div className="
        absolute bottom-10
        text-center
      ">

        <p className="
          text-[10px]
          tracking-[2px]
          text-gray-400
        ">
          POWERED BY STUDENT AFFAIRS
        </p>

        <p className="
          mt-2
          text-[10px]
          text-gray-500
        ">
          ENCRYPTED ADMINISTRATIVE SESSION
        </p>

      </div>

    </div>
  )
}