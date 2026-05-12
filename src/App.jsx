import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { useState, useEffect } from "react"

import Sidebar from "./components/Sidebar"

import Dashboard from "./pages/Dashboard"
import Members from "./pages/Members"
import Events from "./pages/Events"
import AttendanceUpload from "./pages/AttendanceUpload"
import Files from "./pages/Files"
import Masterlist from "./pages/Masterlist"
import Support from "./pages/Support"
import Profile from "./pages/Profile"
import FolderFiles from "./pages/FolderFiles"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import Membership from "./pages/Membership"
import SplashScreen from "./pages/SplashScreen"

export default function App() {

const [loading, setLoading] = useState(true)
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark"
  })

  useEffect(() => {

  // SAVE THEME
  localStorage.setItem(
    "theme",
    darkMode ? "dark" : "light"
  )

  // APPLY THEME
  if (darkMode) {
    document.body.classList.add("dark-mode")
  } else {
    document.body.classList.remove("dark-mode")
  }

}, [darkMode])

useEffect(() => {

 const initializeApp = async () => {

  const startTime = Date.now()

  try {

    // REAL BACKEND CHECK
    await fetch(
      "https://org-manager-o05u.onrender.com/api/profile/",
      {
        credentials: "include"
      }
    )

  } catch (err) {

    console.error(err)

  } finally {

    // MINIMUM SPLASH DURATION
    const elapsed = Date.now() - startTime

    const minimumTime = 2200

    const remaining = minimumTime - elapsed

    setTimeout(() => {

      setLoading(false)

    }, remaining > 0 ? remaining : 0)

  }

}

  initializeApp()

}, [])

  const isAuthenticated = localStorage.getItem("isAuthenticated")

  if (loading) {
  return <SplashScreen />
}

  return (
    <BrowserRouter>

      <Routes>

  {/* 🔐 PUBLIC ROUTES (NO SIDEBAR) */}
  <Route
  path="/login"
  element={<Login darkMode={darkMode} />}
/>
 <Route
  path="/signup"
  element={<Signup darkMode={darkMode} />}
/>

  {/* 🔒 PROTECTED ROUTES */}
  <Route path="/*" element={
    isAuthenticated ? (
      <div className="flex min-h-screen">

        <Sidebar />

        <div className="flex-1 ml-72 p-8 bg-[#F5F5F5] dark-mode:bg-[#0B0F19]">
          <Routes>
            <Route path="/" element={<Dashboard darkMode={darkMode} setDarkMode={setDarkMode} />} />
           <Route
  path="/members"
  element={<Members darkMode={darkMode} />}
/>
            <Route
  path="/events"
  element={<Events darkMode={darkMode} />}
/>
            <Route
  path="/attendance"
  element={<AttendanceUpload darkMode={darkMode} />}
/>
            <Route
  path="/files"
  element={<Files darkMode={darkMode} />}
/>
           <Route
  path="/masterlist"
  element={<Masterlist darkMode={darkMode} />}
/>
          <Route
  path="/support"
  element={<Support darkMode={darkMode} />}
/>
            <Route
  path="/profile"
  element={<Profile darkMode={darkMode} />}
/>
            <Route
  path="/files/:id"
  element={<FolderFiles darkMode={darkMode} />}
/>
           <Route
  path="/membership"
  element={<Membership darkMode={darkMode} />}
/>
          </Routes>
        </div>

      </div>
    ) : (
      <Navigate to="/login" />
    )
  } />

</Routes>

    </BrowserRouter>
  )
}