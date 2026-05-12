import { createContext, useContext, useState, useEffect } from "react"

const ProfileContext = createContext()

export const ProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState(null)

  const fetchProfile = async () => {
    try {
      const res = await fetch("https://org-manager-o05u.onrender.com/api/profile/")
      const data = await res.json()
      setProfile(data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  return (
    <ProfileContext.Provider value={{ profile, setProfile, fetchProfile }}>
      {children}
    </ProfileContext.Provider>
  )
}

export const useProfile = () => useContext(ProfileContext)