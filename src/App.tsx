import './App.css'
import Map from './map/map'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Marker from './marker/marker'

function App() {
    return (
        <div className="wrapper">
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Map />}></Route>
                    <Route path="/marker/:id" element={<Marker />}></Route>
                </Routes>
            </BrowserRouter>
        </div>
    )
}

export default App
