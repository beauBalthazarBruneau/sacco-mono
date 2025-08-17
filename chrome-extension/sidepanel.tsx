import { useState } from "react"
import "./sidepanel.css"

function IndexSidePanel() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
        color: "#ffffff",
        fontFamily: "'Montserrat', sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        margin: 0,
        boxSizing: "border-box"
      }}
    >
      <div
        style={{
          textAlign: "center",
          background: "rgba(30, 41, 59, 0.8)",
          backdropFilter: "blur(8px)",
          borderRadius: "16px",
          padding: "3rem",
          border: "1px solid rgba(56, 189, 125, 0.2)",
          boxShadow: "0 0 20px rgba(56, 189, 125, 0.3)"
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            background: "linear-gradient(135deg, #38bd7d 0%, #16a34a 100%)",
            borderRadius: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1.5rem auto",
            boxShadow: "0 0 20px rgba(56, 189, 125, 0.4)"
          }}
        >
          <span style={{ fontSize: "24px", fontWeight: "bold", color: "#ffffff" }}>
            S
          </span>
        </div>
        <h1
          style={{
            fontSize: "3rem",
            fontWeight: "900",
            color: "#38bd7d",
            margin: "0 0 0.5rem 0",
            textShadow: "0 0 10px rgba(56, 189, 125, 0.5)"
          }}
        >
          HI!
        </h1>
        <p
          style={{
            fontSize: "1rem",
            color: "#94a3b8",
            margin: 0,
            fontWeight: "400"
          }}
        >
          Welcome to Sacco
        </p>
      </div>
    </div>
  )
}

export default IndexSidePanel
