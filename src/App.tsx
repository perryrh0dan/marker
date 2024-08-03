import './App.css'
import Map from './map/map'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Marker from './marker/marker'
import Polygon from './polygon/polygon'
import Statistics from './statistics/statistics'

function App() {
    return (
        <div className="wrapper">
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Map />}></Route>
                    <Route path="/marker/:id" element={<Marker />}></Route>
                    <Route path="/polygon/:id" element={<Polygon />}></Route>
                    <Route path="/statistics" element={<Statistics />}></Route>
                </Routes>
            </BrowserRouter>
        </div>
    )
}

export default App
