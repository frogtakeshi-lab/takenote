import { StrictMode, Component } from 'react'
import type { ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null }
  static getDerivedStateFromError(error: Error) { return { error } }
  render() {
    if (this.state.error) {
      const err = this.state.error as Error
      return (
        <div style={{ padding: 20, fontFamily: 'monospace', fontSize: 14, color: 'red', background: 'white', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
          <b>エラーが発生しました:</b>{'\n\n'}
          {err.message}{'\n\n'}
          {err.stack}
        </div>
      )
    }
    return this.props.children
  }
}

const rootEl = document.getElementById('root')!

try {
  createRoot(rootEl).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  )
} catch (e) {
  rootEl.innerHTML = `<pre style="padding:20px;color:red;font-size:13px;white-space:pre-wrap;word-break:break-all"><b>起動エラー:</b>\n\n${e}</pre>`
}
