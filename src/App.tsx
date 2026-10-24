import { Routes, Route } from 'react-router-dom'
import { DisplayPage } from './pages/DisplayPage'
import { HostPage } from './pages/HostPage'
import { EditorPage } from './pages/EditorPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<DisplayPage />} />
      <Route path="/host" element={<HostPage />} />
      <Route path="/editor" element={<EditorPage />} />
    </Routes>
  )
}
