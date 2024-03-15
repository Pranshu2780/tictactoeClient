import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { Tictactoe } from "./Tictactoe/Tictactoe";
import io from "socket.io-client";
//import { Examp } from "./Tictactoe/Examp";

function App() {
  //const socket = io("http://localhost:3001");

  return (
    <>
      <Tictactoe />
    </>
  );
}

export default App;
