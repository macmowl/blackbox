'use client';

import { loadGameState, saveGameState } from '@/app/actions';
import { AtomMarkerCell, Cell, GridWithLasers } from '@/app/types';
import { GRID_SIZE, cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

export default function GridGeneration() {
  const [grid, setGrid] = useState<GridWithLasers>([]);
  const [shootMode, setShootMode] = useState<boolean>(false);
  const [rayResult, setRayResult] = useState<string | null>(null);
  const [atomCount, setAtomCount] = useState<number>(0);

  useEffect(() => {
    async function fetchGameState() {
      const savedGrid = await loadGameState();
      setGrid(savedGrid);
      //   countAtoms(savedGrid);
    }
    fetchGameState();
  }, []);

  const handleCellClick = (row: number, col: number) => {
    const cell = grid[row][col];
    if (cell.type === 'laser') {
      // Check if the cell is a corner cell
      if (
        (row === 0 && col === 0) ||
        (row === 0 && col === GRID_SIZE + 1) ||
        (row === GRID_SIZE + 1 && col === 0) ||
        (row === GRID_SIZE + 1 && col === GRID_SIZE + 1)
      ) {
        return;
      }
      if (cell.used) return;
      console.log(row, col);
      const result = shootRay(row, col);
      setRayResult(result);
      const newGrid = grid.map((r, rowIndex) =>
        r.map((c, colIndex) => {
          if (rowIndex === row && colIndex === col && c.type === 'laser') {
            console.log('used');
            return { ...c, used: true };
          }
          return c;
        })
      );
      setGrid(newGrid);
      saveGameState(newGrid);
    } else if (shootMode) {
      const newGrid = grid.map((r, rowIndex) =>
        r.map((c, colIndex) => {
          if (rowIndex === row && colIndex === col && c.type === 'atomMarker') {
            return { ...c, marker: !c.marker };
          }
          return c;
        })
      );
      setGrid(newGrid);
      saveGameState(newGrid);
    } else {
      if (cell.type === 'atomMarker') {
        if (cell.atom) {
          const newGrid = grid.map((r, rowIndex) =>
            r.map((c, colIndex) => {
              if (rowIndex === row && colIndex === col) {
                return { ...c, atom: false };
              }
              return c;
            })
          );
          setGrid(newGrid);
          saveGameState(newGrid);
          setAtomCount(atomCount - 1);
        } else if (atomCount < 5) {
          const newGrid = grid.map((r, rowIndex) =>
            r.map((c, colIndex) => {
              if (rowIndex === row && colIndex === col) {
                return { ...c, atom: true };
              }
              return c;
            })
          );
          setGrid(newGrid);
          saveGameState(newGrid);
          setAtomCount(atomCount + 1);
        }
      }
    }
  };

  const shootRay = (startRow: number, startCol: number): string => {
    let row = startRow;
    let col = startCol;
    let direction: [number, number];

    if (startRow === 0) direction = [1, 0]; // Down
    else if (startRow === GRID_SIZE + 1) direction = [-1, 0]; // Up
    else if (startCol === 0) direction = [0, 1]; // Right
    else direction = [0, -1]; // Left

    while (true) {
      row += direction[0];
      col += direction[1];
      if (row < 0 || row >= GRID_SIZE + 1 || col < 0 || col >= GRID_SIZE + 1) {
        return `Ray exited at (${row}, ${col})`;
      }

      const cell = grid[row][col];
      if (cell.type === 'atomMarker' && cell.atom) {
        return `Ray reflected back at (${startRow}, ${startCol})`;
      }

      const adjacent = [
        [row + 1, col - 1], // bottom left
        [row - 1, col + 1], // top right
        [row + 1, col + 1], // bottom right
        [row - 1, col - 1], // top left
      ];

      for (let i = 0; i < adjacent.length; i++) {
        if (
          adjacent[i][0] >= 0 &&
          adjacent[i][0] <= GRID_SIZE + 1 &&
          adjacent[i][1] >= 0 &&
          adjacent[i][1] <= GRID_SIZE + 1
        ) {
          const adjCell = grid[adjacent[i][0]][adjacent[i][1]];
          if (adjCell.type === 'atomMarker' && adjCell.atom) {
            direction = [direction[1], direction[0]];
            break;
          }
        }
      }
    }
  };

  return (
    <>
      <div>
        <button onClick={() => setShootMode(!shootMode)}>
          {shootMode ? 'Switch to Place Atoms' : 'Switch to Shoot Rays'}
        </button>
        <p>Atoms placed: {atomCount} / 5</p>
        {rayResult && <p>{rayResult}</p>}
      </div>
      <div className='border border-gray-700 p-4 flex flex-col gap-2 rounded-md bg-gray-100'>
        {grid.map((row, rowIndex) => (
          <div key={rowIndex} className='flex gap-2 bg-green-300'>
            {row.map((cell, colIndex) => {
              const isLaser = cell.type === 'laser' && cell.number !== null;
              const used = cell.type === 'laser' && cell.used;
              const hasAtom = cell.type === 'atomMarker' && cell.atom;
              const hasMarker = cell.type === 'atomMarker' && cell.marker;
              return (
                <div
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                  className={cn(
                    'size-12 border border-gray-500 flex items-center justify-center cursor-pointer rounded-sm bg-white hover:bg-gray-200',
                    shootMode && hasAtom ? 'text-transparent' : '',
                    hasMarker ? 'text-gray-900' : '',
                    isLaser ? 'bg-red-300 hover:bg-red-400 border-red-500' : '',
                    used
                      ? 'bg-gray-200 cursor-default hover:bg-gray-200 border-gray-200 text-gray-400'
                      : ''
                  )}
                  key={colIndex}
                >
                  {isLaser ? cell.number : hasAtom ? 'A' : hasMarker ? 'M' : ''}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </>
  );
}
