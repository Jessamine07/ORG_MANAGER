export default function LogoutSplash() {

  return (

    <div className="
      fixed inset-0
      z-[99999]

      bg-[#F8F8F8]

      flex flex-col
      items-center
      justify-center
    ">

      {/* LOGO */}
      <div
        className="
          w-28 h-28
          rounded-full
          overflow-hidden

          border-[6px]
          border-white

          shadow-[0_15px_40px_rgba(60,0,8,0.35)]
        "
      >

        <img
          src="/logosvg.png"
          alt="Logo"

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
        text-4xl
        font-black
        text-[#1F1F1F]
      ">
        SIGNING OUT
      </h1>

      <p className="
        mt-3
        text-sm
        tracking-[3px]
        text-[#3C0008]
      ">
        TERMINATING SECURE SESSION
      </p>

      {/* SPINNER */}
      <div className="
        mt-10

        w-10 h-10

        border-4
        border-gray-300

        border-t-[#3C0008]

        rounded-full

        animate-spin
      " />

    </div>

  )

}