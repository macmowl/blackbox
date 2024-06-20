import { Cell, GridWithLasers } from "@/app/types";
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const GRID_SIZE = 8

export const initializeGrid = (): GridWithLasers => {
  const grid: GridWithLasers = [];

  for (let i = 0; i < GRID_SIZE + 2; i++) {
    const row: Cell[] = [];
    for (let j = 0; j < GRID_SIZE + 2; j++) {
      if ((i === 0 && (j === 0 || j === GRID_SIZE + 1)) || (i === GRID_SIZE + 1 && (j === 0 || j === GRID_SIZE + 1))) {
        row.push({ type: 'laser', number: null, used: false }); // Corner cells
      } else if (i === 0 || i === GRID_SIZE + 1 || j === 0 || j === GRID_SIZE + 1) {
        if (i === 0 && j > 0 && j < GRID_SIZE + 1) {
          row.push({ type: 'laser', number: GRID_SIZE*4 - j +1, used: false }); // Right Column
        } else if (j === GRID_SIZE + 1 && i > 0 && i < GRID_SIZE + 1) {
          row.push({ type: 'laser', number: GRID_SIZE*3 - i + 1, used: false }); // Bottom row
        } else if (i === GRID_SIZE + 1 && j > 0 && j < GRID_SIZE + 1) {
          row.push({ type: 'laser', number: GRID_SIZE + j, used: false }); // Left Colum
        } else if (j === 0 && i > 0 && i < GRID_SIZE + 1) {
          row.push({ type: 'laser', number: i, used: false }); // Top row
        }
      } else {
        row.push({ type: 'atomMarker', atom: false, marker: false });
      }
    }
    grid.push(row);
  }
  return grid;
};