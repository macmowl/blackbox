import { AtomMarkerCell, Cell, GridWithLasers } from "@/app/types";
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

export const isRayReflected = (row: number, col: number, grid: GridWithLasers): boolean => {
  const edgeAtoms = [
    [1, col - 1], [1, col + 1],        // Row 1, left and right
    [GRID_SIZE, col - 1], [GRID_SIZE, col + 1],  // Last row, left and right
    [row - 1, 1], [row + 1, 1],        // Column 1, top and bottom
    [row - 1, GRID_SIZE], [row + 1, GRID_SIZE]   // Last column, top and bottom
  ];

  return edgeAtoms.some(([r, c]) => 
    grid[r] && grid[r][c] && 
    grid[r][c].type === 'atomMarker' && 
    (grid[r][c] as AtomMarkerCell).atom
  );
};

export const isAdjacentToLaser = (direction: [number, number], row: number, col: number, grid: GridWithLasers) => {
  const adjacentCells = [
    [row - 1, col + 1], // Haut
    [row + 1, col - 1], // Bas
    [row - 1, col - 1], // Gauche
    [row + 1, col + 1], // Droite
  ];

  let adjacentAtoms = 0;
  for (const pos of adjacentCells) {
    const [adjRow, adjCol] = pos;
    if (
      adjRow >= 0 &&
      adjRow <= GRID_SIZE + 1 &&
      adjCol >= 0 &&
      adjCol <= GRID_SIZE + 1 &&
      grid[adjRow][adjCol].type === 'atomMarker' &&
      (grid[adjRow][adjCol] as AtomMarkerCell).atom
    ) {
      adjacentAtoms++;
    }
  }

  // Inverser la direction si deux atomes adjacents sont trouvés
  if (adjacentAtoms >= 2) {
    direction = [-direction[0], -direction[1]];
  } else {
    // Continuer de dévier le rayon si un seul atome adjacent est trouvé
    for (const pos of adjacentCells) {
      const [adjRow, adjCol] = pos;
      if (
        adjRow >= 0 &&
        adjRow <= GRID_SIZE + 1 &&
        adjCol >= 0 &&
        adjCol <= GRID_SIZE + 1 &&
        grid[adjRow][adjCol].type === 'atomMarker' &&
        (grid[adjRow][adjCol] as AtomMarkerCell).atom
      ) {
        if (direction[0] === 0 && direction[1] === 1) {
          // vers la droite
          if (adjRow === row + 1) {
            direction = [-1, 0];
          } else {
            direction = [1, 0];
          }
        } else if (direction[0] === 1 && direction[1] === 0) {
          // vers le bas
          if (adjCol === col + 1) {
            direction = [0, -1];
          } else {
            direction = [0, 1];
          }
        } else if (direction[0] === 0 && direction[1] === -1) {
          // vers la gauche
          if (adjRow === row - 1) {
            direction = [1, 0];
          } else {
            direction = [-1, 0];
          }
        } else if (direction[0] === -1 && direction[1] === 0) {
          // vers le haut
          if (adjCol === col - 1) {
            direction = [0, 1];
          } else {
            direction = [0, -1];
          }
        }
        break;
      }
    }
  }
}