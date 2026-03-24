import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage/HomePage';
import JoinPage from './components/JoinPage/JoinPage.jsx';
import CreatePage from './components/CreatePage/CreatePage';
import GameCode from './components/Gamecode/Gamecode.jsx';
import CountdownPage from './components/CountdownPage/CountdownPage';
import Canvas from './components/Canvas/Canvas';
import GameOverPage from './components/GameOverPage/GameOverPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/join" element={<JoinPage />} />
        <Route path="/create" element={<CreatePage />} />
        <Route path="/gamecode" element={<GameCode />} />
        <Route path="/countdown" element={<CountdownPage />} />
        <Route path="/canvas" element={<Canvas />} />
        <Route path="/gameover" element={<GameOverPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;