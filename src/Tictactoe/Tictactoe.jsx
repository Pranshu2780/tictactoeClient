import React, { useState, useEffect } from "react";
import s from "./style.module.css";
import io from "socket.io-client";

let socket = null;
export const Tictactoe = () => {
  const initialBoard = Array(9).fill(null);

  const [board, setBoard] = useState(initialBoard);
  const [winner, setWinner] = useState(null);
  const [symbol, setSymbol] = useState(null);
  const [myTurn, setMyTurn] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [numClients, setNumClients] = useState(0);

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SERVER_URL;
    socket = io(socketUrl);
  }, []);

  useEffect(() => {
    socket.on("moveMade", (data) => {
      console.log(data);
      const { index, symbol } = data;
      console.log("movemade received");
      console.log(index);
      console.log(symbol);
      makeLocalMove(index, symbol);
    });

    return () => socket.off("moveMade");
  }, [board]);

  useEffect(() => {
    socket.on("ConnectedClients", (numOfClients) => {
      console.log("connection");
      setNumClients(numOfClients);
    });

    return () => socket.off("ConnectedClients");
  }, [board]);

  useEffect(() => {
    socket.on("spectatorBoard", (specBoard) => {
      console.log("board received");
      setBoard(specBoard);
    });

    return () => socket.off("spectatorBoard");
  }, [board]);

  useEffect(() => {
    socket.on("endgame", (data) => {
      const { gameOver, winner } = data;
      setGameOver(gameOver);
      setWinner(winner);
    });

    return () => socket.off("moveMade");
  }, [board]);

  useEffect(() => {
    console.log("new game useeffect ran");
    socket.on("newGame", (data) => {
      resetBoard();
    });

    return () => socket.off("newGame");
  }, [gameOver]);

  useEffect(() => {
    socket.on("turnData", (turn) => {
      setMyTurn(turn);
    });

    return () => socket.off("turnData");
  }, [board]);

  useEffect(() => {
    socket.on("beginData", (data) => {
      console.log(data);
      const { turn, symbol, specBoard } = data;
      setSymbol(symbol);
      setMyTurn(turn);
      if (symbol === "Spectator") {
        console.log(specBoard);
        setBoard(specBoard);
      }
    });
    return () => socket.off("beginData");
  }, []);

  const calculateWinner = (board) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8], // Rows
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8], // Columns
      [0, 4, 8],
      [2, 4, 6], // Diagonals
    ];

    for (let line of lines) {
      //console.log(line);
      const [a, b, c] = line;
      //   console.log(board[a]);
      //   console.log(board[b]);
      //   console.log(board[c]);
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        console.log(line + "is made");
        return board[a];
      }
    }

    return null;
  };

  const resetBoard = () => {
    console.log("2");
    setBoard(initialBoard);
    setWinner(null);
    setSymbol(null);
    setMyTurn(false);
    setGameOver(false);
  };

  const restartGame = () => {
    socket.emit("restartGame", true);
    resetBoard();
  };

  const makeLocalMove = (index, symbol) => {
    const newBoard = [...board];
    newBoard[index] = symbol;
    setBoard(newBoard);
  };

  const handleClick = (index) => {
    if (board[index]) return;
    makeLocalMove(index, symbol);
    socket.emit("makeMove", { index, symbol });
  };

  return (
    <>
      {gameOver ? (
        <div className="winner">{winner ? "You Won!" : "You lost!"}</div>
      ) : (
        <>
          <div>{myTurn ? "Make your move" : "Waiting for other player"}</div>
          <div>Your symbol: {symbol}</div>
        </>
      )}
      <div>
        {gameOver ? (
          <button className={s.restartButton} onClick={restartGame}>
            Restart Game
          </button>
        ) : (
          <></>
        )}
      </div>
      <div className={s.board}>
        {board.map((cell, index) => {
          return (
            <button
              className={s.cell}
              key={index}
              onClick={() => myTurn && !gameOver && handleClick(index)}
              disabled={gameOver}
            >
              {cell}
            </button>
          );
        })}
      </div>
      <div>Players Connected: {numClients}</div>
    </>
  );
};
