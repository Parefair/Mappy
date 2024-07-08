// import { APIProvider } from "@vis.gl/react-google-maps";
// import { Routes, Route, Outlet, Link } from "react-router-dom";
import "./index.css";

import { MapPage, Nav } from "./component";

function App() {
  return (
    <>
      <div className="font-mono h-screen w-screen flex flex-col items-center bg-rose-50 gap-5">
        <Nav />
        <div className="flex overflow-auto w-5/6 h-4/5">
          <MapPage />
        </div>
      </div>
    </>
  );
}

export default App;
