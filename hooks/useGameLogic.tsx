import { useState } from 'react';
import { GridWithLasers, Cell, AtomMarkerCell } from '@/app/types';
import { GRID_SIZE } from '@/lib/utils';
import { saveGameState } from '@/app/actions';

const isAtomMarkerCell = (cell: Cell): cell is AtomMarkerCell => {
  return cell !== 'laser';
};

export const useGameLogic = (
  grid: GridWithLasers,
  setGrid: React.Dispatch<React.SetStateAction<GridWithLasers>>,
  atomCount: number,
  setAtomCount: React.Dispatch<React.SetStateAction<number>>,
  setRayResult: React.Dispatch<React.SetStateAction<string | null>>,
  shootMode: boolean
) => {
  const handleCellClick = (row: number, col: number) => {
    if (grid[row][col] === 'laser') {
      const result = shootRay(row, col);
      setRayResult(result);
    } else if (shootMode) {
      const newGrid = grid.map((r, rowIndex) =>
        r.map((cell, colIndex) => {
          if (rowIndex === row && colIndex === col && cell !== 'laser') {
            return { ...cell, marker: !cell.marker };
          }
          return cell;
        })
      );
      setGrid(newGrid);
      saveGameState(newGrid);
    } else {
      if (isAtomMarkerCell(grid[row][col]) && grid[row][col].atom) {
        const newGrid = grid.map((r, rowIndex) =>
          r.map((cell, colIndex) => {
            if (rowIndex === row && colIndex === col && cell !== 'laser') {
              return { ...cell, atom: false };
            }
            return cell;
          })
        );
        setGrid(newGrid);
        saveGameState(newGrid);
        setAtomCount(atomCount - 1);
      } else if (atomCount < 5) {
        const newGrid = grid.map((r, rowIndex) =>
          r.map((cell, colIndex) => {
            if (rowIndex === row && colIndex === col && cell !== 'laser') {
              return { ...cell, atom: true };
            }
            return cell;
          })
        );
        setGrid(newGrid);
        saveGameState(newGrid);
        setAtomCount(atomCount + 1);
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
      if (grid[row][col] !== 'laser' && grid[row][col].atom)
        return `Ray reflected back at (${startRow}, ${startCol})`;

      const adjacent = [
        [row - 1, col],
        [row + 1, col],
        [row, col - 1],
        [row, col + 1],
      ];

      for (let [adjRow, adjCol] of adjacent) {
        if (
          adjRow >= 0 &&
          adjRow < GRID_SIZE &&
          adjCol >= 0 &&
          adjCol < GRID_SIZE
        ) {
          if (grid[adjRow][adjCol] !== 'laser' && grid[adjRow][adjCol].atom) {
            direction = [direction[1], direction[0]];
            break;
          }
        }
      }
    }
  };

  return {
    handleCellClick,
    shootRay,
  };
};
