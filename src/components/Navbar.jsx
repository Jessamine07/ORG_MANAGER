<div className="flex justify-between items-center mb-10">

        <h1 className="text-lg font-bold tracking-widest text-[#3C0008]">
          OFFICER PORTAL
        </h1>

        <div className="flex items-center gap-6">

         <div className="flex items-center px-4 py-2 rounded-full 
                border border-gray-400 
                bg-transparent">
            <Search size={16}/>
  <input
  type="text"
  placeholder="Search data..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  className="search-input ml-2 text-sm w-40 appearance-none
             bg-transparent
             border-none outline-none
             focus:outline-none focus:ring-0 focus:border-none
             ring-0
             placeholder:text-gray-400"
  style={{
    background: "transparent",
    boxShadow: "none",
    outline: "none"
  }}
/>
          </div>

          <div className="relative" ref={profileRef}>

  {/* 🔔 BELL */}
  <Bell
    className="cursor-pointer"
    onClick={() => {
  setShowNotif(!showNotif)
  fetchRequests() // 🔥 load join requests
}}
  />

  {/* 🔻 DROPDOWN */}
  {showNotif && (
    <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl p-4 z-50">

      <div className="flex justify-between items-center mb-3">
  <h3 className="font-semibold text-sm text-[#3C0008]">
    Notifications
  </h3>

  <button
    onClick={clearNotifications}
    className="text-xs text-[#3C0008] hover:underline"
  >
    Clear all
  </button>
</div>

      <div className="space-y-3 max-h-60 overflow-y-auto">

        {notifications.length === 0 ? (
          <p className="text-sm text-gray-400 text-center">
            No notifications
          </p>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className="p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
            >
              <p className="text-sm">{notif.message}</p>
              <p className="text-xs text-gray-400">{notif.time}</p>
            </div>
          ))
        )}

      </div>

    </div>
  )}

</div>
          <button
  onClick={() => setDarkMode(!darkMode)}
  className="p-2 rounded-full hover:bg-gray-200 transition"
>
  {darkMode ? (
    <Sun size={18} className="text-yellow-400" />
  ) : (
    <Moon size={18} />
  )}
</button>

    <div className="relative" ref={profileRef}>

  {/* PROFILE BUTTON */}
  <div
    onClick={() => setShowProfile(!showProfile)}
    className="flex items-center gap-3 cursor-pointer"
  >
    <div className="text-right text-xs leading-tight">
      <p className="font-semibold dark-mode:text-white">
  {profile?.name || "Officer"}
</p>
      <p className="opacity-60 text-xs">
        ADMIN ACCESS
      </p>
    </div>

   {profile?.profile_image ? (
  <img
  src={
    profile?.profile_image
      ? profile.profile_image + "?t=" + new Date().getTime()
      : "/default-avatar.png"
  }
  className="w-9 h-9 rounded-full object-cover"
/>
) : (
  <div className="w-9 h-9 bg-gray-300 rounded-full"></div>
)}
  </div>

  {/* DROPDOWN */}
  {showProfile && (
    <div className="absolute right-0 mt-3 w-52 bg-white dark-mode:bg-[#111827] rounded-xl shadow-xl p-2 z-50">

  {/* ✅ USER INFO */}
  <div className="px-3 py-2 border-b mb-2">
    <p className="text-sm font-semibold dark-mode:text-white">
  {profile?.name || "Loading..."}
</p>
    <p className="text-xs text-gray-400">
      officer@email.com
    </p>
  </div>

 <button
  onClick={() => {
    setShowProfile(false) // close dropdown
    navigate("/profile")
  }}
  className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-gray-100 dark-mode:hover:bg-[#1F2937]"
>
  Profile Settings
</button>

</div>
  )}

</div>

        </div>
      </div>