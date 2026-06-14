import React from "react"

import ReactDOM from "react-dom/client"

import App from "./App"

import "./index.css"

import { AppProvider } from "./context/AppProvider"

import { ThemeProvider } from "./context/ThemeProvider"

import { HapticsProvider } from "./context/HapticsContext"

ReactDOM.createRoot(
  document.getElementById("root")
).render(

  <React.StrictMode>

    <ThemeProvider>

      <HapticsProvider>

        <AppProvider>

          <App />

        </AppProvider>

      </HapticsProvider>

    </ThemeProvider>

  </React.StrictMode>

)