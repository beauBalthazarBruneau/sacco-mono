import { useState, useEffect } from "react"
import { getAuthStatus, signInWithMagicLink, signOut } from "./lib/supabase"

function IndexPopup() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [user, setUser] = useState<any>(null)
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    const { isAuthenticated, user, error } = await getAuthStatus()
    setIsAuthenticated(isAuthenticated)
    setUser(user)
    if (error) {
      setMessage("Error checking auth status")
    }
  }

  const handleSignIn = async () => {
    if (!email) {
      setMessage("Please enter an email address")
      return
    }

    setLoading(true)
    setMessage("")
    
    const { error } = await signInWithMagicLink(email)
    
    if (error) {
      setMessage(`Error: ${error.message}`)
    } else {
      setMessage("Check your email for the magic link!")
      setEmail("")
    }
    
    setLoading(false)
  }

  const handleSignOut = async () => {
    setLoading(true)
    const { error } = await signOut()
    
    if (error) {
      setMessage(`Error signing out: ${error.message}`)
    } else {
      setIsAuthenticated(false)
      setUser(null)
      setMessage("Signed out successfully")
    }
    
    setLoading(false)
  }

  return (
    <div style={{ padding: 16, width: 300 }}>
      <h2 style={{ margin: "0 0 16px 0", fontSize: "18px" }}>
        Sacco Extension
      </h2>
      
      {message && (
        <div style={{ 
          padding: "8px", 
          marginBottom: "16px", 
          backgroundColor: message.includes("Error") ? "#fee" : "#efe",
          color: message.includes("Error") ? "#c33" : "#363",
          borderRadius: "4px",
          fontSize: "14px"
        }}>
          {message}
        </div>
      )}

      {isAuthenticated === null ? (
        <div>Loading...</div>
      ) : isAuthenticated ? (
        <div>
          <div style={{ marginBottom: "16px" }}>
            <strong>✅ Authenticated</strong>
            {user && (
              <div style={{ fontSize: "14px", color: "#666", marginTop: "4px" }}>
                {user.email}
              </div>
            )}
          </div>
          <button 
            onClick={handleSignOut}
            disabled={loading}
            style={{
              padding: "8px 16px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? "Signing out..." : "Sign Out"}
          </button>
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: "16px" }}>
            <strong>❌ Not Authenticated</strong>
          </div>
          <div style={{ marginBottom: "12px" }}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                boxSizing: "border-box"
              }}
            />
          </div>
          <button 
            onClick={handleSignIn}
            disabled={loading}
            style={{
              width: "100%",
              padding: "8px 16px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? "Sending..." : "Sign In with Magic Link"}
          </button>
        </div>
      )}
    </div>
  )
}

export default IndexPopup
