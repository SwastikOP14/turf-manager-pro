import { Component } from "react"

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '20px',
          backgroundColor: '#f8fafc',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '64px',
            marginBottom: '20px'
          }}>
            ⚠️
          </div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#1e293b',
            marginBottom: '10px'
          }}>
            Something went wrong
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#64748b',
            marginBottom: '30px',
            maxWidth: '400px'
          }}>
            The app encountered an unexpected error. Please try reloading the page.
          </p>
          <button
            onClick={this.handleReload}
            style={{
              padding: '12px 32px',
              fontSize: '16px',
              fontWeight: '600',
              color: '#fff',
              backgroundColor: '#22c55e',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
              transition: 'transform 0.2s'
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            Reload App
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
