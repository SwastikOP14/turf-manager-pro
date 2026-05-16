import React from "react"
import ReactDOM from "react-dom/client"

import App from "./App"
import "./index.css"

import { ThemeProvider } from "./context/ThemeContext"
import { AppProvider } from "./context/AppContext"

ReactDOM.createRoot(document.getElementById("root")).render(

  <React.StrictMode>

    <ThemeProvider>

      <AppProvider>
        <App />
      </AppProvider>

    </ThemeProvider>

  </React.StrictMode>

)