"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePersonality } from "@/components/personality";

/* Snake jogavel dentro do terminal. Herdado do portfolio de 2025: mesma grade
   de texto, mesmo tick, setas ou WASD, Q para sair.

   O estado do jogo vive num ref e avanca dentro do tick, nunca dentro de um
   updater de setState: updater precisa ser puro, e aqui cada passo toca som e
   destrava conquista. O React so e avisado de que ha um quadro novo. */

const COLS = 22;
const ROWS = 11;
const TICK = 145;

type Point = { x: number; y: number };

const DIRS: Record<string, Point> = {
  ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 },
  w: { x: 0, y: -1 }, s: { x: 0, y: 1 }, a: { x: -1, y: 0 }, d: { x: 1, y: 0 },
};

type Game = {
  snake: Point[];
  fruit: Point;
  dir: Point;
  next: Point;
  score: number;
  over: boolean;
};

const dropFruit = (snake: Point[]): Point => {
  let spot: Point;
  do {
    spot = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
  } while (snake.some((part) => part.x === spot.x && part.y === spot.y));
  return spot;
};

type View = { rows: string[]; score: number; over: boolean };

// Snapshot imutavel do quadro: e isso que o React renderiza, nunca o ref.
const toView = (state: Game): View => {
  const rows: string[] = [];
  for (let y = 0; y < ROWS; y += 1) {
    let row = "";
    for (let x = 0; x < COLS; x += 1) {
      const isHead = state.snake[0].x === x && state.snake[0].y === y;
      const isBody = !isHead && state.snake.some((part) => part.x === x && part.y === y);
      if (isHead) row += "\u2588";
      else if (isBody) row += "\u2593";
      else if (state.fruit.x === x && state.fruit.y === y) row += "\u25c6";
      else row += "\u00b7";
    }
    rows.push(row);
  }
  return { rows, score: state.score, over: state.over };
};

const newGame = (): Game => ({
  snake: [{ x: 6, y: 5 }, { x: 5, y: 5 }, { x: 4, y: 5 }],
  fruit: { x: 14, y: 5 },
  dir: { x: 1, y: 0 },
  next: { x: 1, y: 0 },
  score: 0,
  over: false,
});

export function Snake({ onExit }: { onExit: (score: number) => void }) {
  const game = useRef<Game>(newGame());
  const [view, setView] = useState<View>(() => toView(newGame()));
  const { sound, achievements } = usePersonality();

  const turn = useCallback((to: Point) => {
    const current = game.current;
    if (to.x === -current.dir.x && to.y === -current.dir.y) return;
    current.next = to;
  }, []);

  const quit = useCallback(() => onExit(game.current.score), [onExit]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const state = game.current;
      if (state.over) return;

      state.dir = state.next;
      const head = { x: state.snake[0].x + state.dir.x, y: state.snake[0].y + state.dir.y };
      const hitWall = head.x < 0 || head.y < 0 || head.x >= COLS || head.y >= ROWS;
      const hitSelf = state.snake.some((part) => part.x === head.x && part.y === head.y);

      if (hitWall || hitSelf) {
        state.over = true;
        sound.play("error");
        window.setTimeout(() => onExit(state.score), 1400);
      } else {
        state.snake = [head, ...state.snake];
        if (head.x === state.fruit.x && head.y === state.fruit.y) {
          state.score += 10;
          state.fruit = dropFruit(state.snake);
          sound.play("eat");
          achievements.unlock("snake");
        } else {
          state.snake.pop();
        }
      }
      setView(toView(state));
    }, TICK);
    return () => window.clearInterval(timer);
  }, [achievements, onExit, sound]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      if (key === "q" || event.key === "Escape") {
        event.preventDefault();
        quit();
        return;
      }
      const to = DIRS[key];
      if (!to) return;
      event.preventDefault();
      turn(to);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [quit, turn]);

  return (
    <div className="terminal-game">
      <p className="terminal-game-score">
        pontos: {view.score}{view.over ? " — fim de jogo" : ""}
      </p>
      <pre aria-hidden="true">{view.rows.join("\n")}</pre>
      <p className="terminal-game-help">setas ou WASD para mover · Q para sair</p>
      <div className="terminal-game-pad" role="group" aria-label="Controles do snake">
        <button type="button" onClick={() => turn(DIRS.ArrowUp)} aria-label="Cima">↑</button>
        <button type="button" onClick={() => turn(DIRS.ArrowLeft)} aria-label="Esquerda">←</button>
        <button type="button" onClick={() => turn(DIRS.ArrowDown)} aria-label="Baixo">↓</button>
        <button type="button" onClick={() => turn(DIRS.ArrowRight)} aria-label="Direita">→</button>
        <button type="button" onClick={quit}>sair</button>
      </div>
    </div>
  );
}
