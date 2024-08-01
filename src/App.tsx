import './App.css'
import Map from './map/map'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Marker from './marker/marker'
import Polygon from './polygon/polygon'

function App() {
    return (
        <div className="wrapper">
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Map />}></Route>
                    <Route path="/marker/:id" element={<Marker />}></Route>
                    <Route path="/polygon/:id" element={<Polygon />}></Route>
                </Routes>
            </BrowserRouter>
        </div>
    )
}

export default App
