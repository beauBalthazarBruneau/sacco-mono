import { useState } from "react"

function IndexSidePanel() {
  const [data, setData] = useState("")

  return (
    <div
      style={{
        padding: 16,
        minHeight: "100vh",
        backgroundColor: "#f5f5f5"
      }}>
      <h2>
        Welcome to your{" "}
        <a href="https://www.plasmo.com" target="_blank">
          Plasmo
        </a>{" "}
        Extension!
      </h2>
      <input 
        onChange={(e) => setData(e.target.value)} 
        value={data}
        placeholder="Enter some data..."
        style={{
          width: "100%",
          padding: "8px",
          marginBottom: "16px",
          border: "1px solid #ccc",
          borderRadius: "4px"
        }}
      />
      <div style={{ marginBottom: "16px" }}>
        <strong>Current data:</strong> {data || "No data entered"}
      </div>
      <a 
        href="https://docs.plasmo.com" 
        target="_blank"
        style={{
          color: "#007bff",
          textDecoration: "none"
        }}
      >
        View Docs
      </a>
    </div>
  )
}

export default IndexSidePanel
