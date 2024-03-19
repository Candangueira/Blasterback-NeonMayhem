import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Canvas } from "@react-three/fiber"
import { Health } from '../components/Health.jsx'
import { Points } from '../components/Points.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    
    <div id="container">
    
    {/* <Points/> */}
      {/* aim in the middle of the screen */}
      <div className="aim"></div>
      <div className="health"><Health/></div>
      <div className="points">Points: <Points/></div>
      {/* setting the camera FOV */}
        <Canvas camera={{ fov: 45, position: [0, 5, 0] }} shadows>
          
          <App />
          
        </Canvas>

    </div>
  </React.StrictMode>,
)
