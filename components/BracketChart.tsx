'use client';

import Image from 'next/image';
import { Typography } from 'antd';
import type { BracketState, Movie } from '@/types';
import styles from './BracketChart.module.css';

const { Text } = Typography;

const SLOT_H = 32;
const CARD_H = 24;
const CARD_W = 164;
const CON_W = 44;
const HEADER_H = 28;

function posY(r: number, i: number): number {
  return (i + 0.5) * SLOT_H * Math.pow(2, r);
}

function buildPosMap(rounds: Movie[][]): number[][] {
  const map: number[][] = [];
  map[0] = rounds[0].map((_, i) => posY(0, i));

  for (let r = 0; r < rounds.length - 1; r++) {
    const cur = rounds[r];
    const matchups = Math.floor(cur.length / 2);
    const hasBye = cur.length % 2 === 1;
    map[r + 1] = [];
    for (let i = 0; i < matchups; i++) {
      map[r + 1][i] = (map[r][2 * i] + map[r][2 * i + 1]) / 2;
    }
    if (hasBye) {
      map[r + 1][matchups] = map[r][cur.length - 1];
    }
  }
  return map;
}

function colLabel(col: number, numCols: number): string {
  if (col === numCols - 1) return 'Champion';
  const fromEnd = numCols - 1 - col;
  if (fromEnd === 1) return 'Final';
  if (fromEnd === 2) return 'Semifinal';
  if (fromEnd === 3) return 'Quarterfinal';
  return `Round ${col + 1}`;
}

function MovieBox({
  movie,
  x,
  y,
  won,
  lost,
  champion,
}: {
  movie: Movie;
  x: number;
  y: number;
  won: boolean;
  lost: boolean;
  champion: boolean;
}) {
  const boxClass = [
    styles.movieBox,
    champion ? styles.movieBoxChampion : won ? styles.movieBoxWon : '',
    lost ? styles.movieBoxLost : '',
  ].filter(Boolean).join(' ');

  const nameClass = [
    styles.movieName,
    champion ? styles.movieNameChampion : won ? styles.movieNameWon : '',
    lost ? styles.movieNameLost : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      className={boxClass}
      style={{ position: 'absolute', left: x, top: y, width: CARD_W, height: CARD_H }}
    >
      {movie.poster && (
        <div className={styles.posterMini}>
          <Image
            src={movie.poster}
            alt={movie.name}
            fill
            className={styles.posterMiniImg}
            sizes='14px'
          />
        </div>
      )}
      <Text className={nameClass}>{movie.name}</Text>
      {champion && <span className={styles.champIcon}>🏆</span>}
    </div>
  );
}

export default function BracketChart({
  state,
  accentColor,
}: {
  state: BracketState;
  accentColor: string;
}) {
  const { rounds } = state;
  const numCols = rounds.length;
  const pm = buildPosMap(rounds);

  const totalW = numCols * CARD_W + (numCols - 1) * CON_W;
  const totalH = rounds[0].length * SLOT_H + HEADER_H;

  const lines: React.ReactNode[] = [];
  for (let r = 0; r < numCols - 1; r++) {
    const cur = rounds[r];
    const matchups = Math.floor(cur.length / 2);
    const hasBye = cur.length % 2 === 1;
    const xR = r * (CARD_W + CON_W) + CARD_W;
    const xM = xR + CON_W / 2;
    const xL = (r + 1) * (CARD_W + CON_W);

    for (let i = 0; i < matchups; i++) {
      const yA = pm[r][2 * i] + HEADER_H;
      const yB = pm[r][2 * i + 1] + HEADER_H;
      const yW = pm[r + 1][i] + HEADER_H;
      lines.push(
        <g key={`m${r}-${i}`} stroke='#c8b880' strokeWidth={1.2} fill='none'>
          <line x1={xR} y1={yA} x2={xM} y2={yA} />
          <line x1={xR} y1={yB} x2={xM} y2={yB} />
          <line x1={xM} y1={yA} x2={xM} y2={yB} />
          <line x1={xM} y1={yW} x2={xL} y2={yW} />
        </g>,
      );
    }

    if (hasBye) {
      const yBye = pm[r][cur.length - 1] + HEADER_H;
      const yNext = pm[r + 1][matchups] + HEADER_H;
      lines.push(
        <line
          key={`bye${r}`}
          x1={xR}
          y1={yBye}
          x2={xL}
          y2={yNext}
          stroke='#c8b880'
          strokeWidth={1.2}
          strokeDasharray='4 3'
        />,
      );
    }
  }

  const boxes: React.ReactNode[] = [];
  for (let r = 0; r < numCols; r++) {
    const cur = rounds[r];
    const next = rounds[r + 1];
    const hasBye = cur.length % 2 === 1;
    const x = r * (CARD_W + CON_W);
    const isChampionCol = r === numCols - 1;

    for (let i = 0; i < cur.length; i++) {
      const movie = cur[i];
      const y = pm[r][i] - CARD_H / 2 + HEADER_H;
      let won = false;
      let lost = false;

      if (!isChampionCol && next) {
        const isBye = hasBye && i === cur.length - 1;
        if (isBye) {
          won = true;
        } else {
          const w = next[Math.floor(i / 2)];
          won = w?.name === movie.name;
          lost = !won;
        }
      }

      boxes.push(
        <MovieBox
          key={`b${r}-${i}`}
          movie={movie}
          x={x}
          y={y}
          won={won}
          lost={lost}
          champion={isChampionCol}
        />,
      );
    }
  }

  const headers = rounds.map((_, r) => (
    <div
      key={r}
      className={styles.colHeader}
      style={{ left: r * (CARD_W + CON_W), width: CARD_W, height: HEADER_H }}
    >
      <Text className={styles.colLabel}>{colLabel(r, numCols)}</Text>
    </div>
  ));

  return (
    <div
      className={styles.chartOuter}
      style={{ '--accent': accentColor } as React.CSSProperties}
    >
      <div style={{ position: 'relative', width: totalW, height: totalH, minWidth: totalW }}>
        <svg
          width={totalW}
          height={totalH}
          className={styles.connectorSvg}
        >
          {lines}
        </svg>
        {headers}
        {boxes}
      </div>
    </div>
  );
}
