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
  const [markerCount, setMarkerCount] = useState<number>(0);
  const [validationResult, setValidationResult] = useState<string | null>(null);

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
      const currentMarkers = markerCount + (cell.marker ? -1 : 1);
      if (currentMarkers > atomCount) {
        setValidationResult(
          'You cannot place more markers than there are atoms.'
        );
        return;
      }
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
      setMarkerCount(currentMarkers);
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

    if (startRow === 0) direction = [1, 0]; // Vers le bas
    else if (startRow === GRID_SIZE + 1) direction = [-1, 0]; // Vers le haut
    else if (startCol === 0) direction = [0, 1]; // Vers la droite
    else direction = [0, -1]; // Vers la gauche

    const MAX_STEPS = GRID_SIZE * 4; // Limite le nombre de pas pour éviter une boucle infinie
    let steps = 0;

    while (steps < MAX_STEPS) {
      row += direction[0];
      col += direction[1];
      steps += 1;

      if (row < 0 || row > GRID_SIZE + 1 || col < 0 || col > GRID_SIZE + 1) {
        return `Ray exited at (${row}, ${col})`;
      }

      const cell = grid[row][col];
      if (cell.type === 'atomMarker' && cell.atom) {
        return `Ray reflected back at (${startRow}, ${startCol})`;
      }

      // Vérifier la présence d'atomes adjacents pour dévier le rayon
      const adjacentCells = [
        { pos: [row - 1, col + 1], dir: [-1, 0] }, // Haut
        { pos: [row + 1, col - 1], dir: [1, 0] }, // Bas
        { pos: [row - 1, col - 1], dir: [0, 1] }, // Gauche
        { pos: [row + 1, col + 1], dir: [0, -1] }, // Droite
      ];

      for (const { pos, dir } of adjacentCells) {
        const [adjRow, adjCol] = pos;
        if (
          adjRow >= 0 &&
          adjRow <= GRID_SIZE + 1 &&
          adjCol >= 0 &&
          adjCol <= GRID_SIZE + 1 &&
          grid[adjRow][adjCol].type === 'atomMarker' &&
          (grid[adjRow][adjCol] as AtomMarkerCell).atom
        ) {
          // Modifier la direction du rayon de 90° en fonction de la position de l'atome adjacent
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

    return `Ray stuck in an infinite loop at (${row}, ${col})`;
  };

  const validateMarkers = () => {
    let correctMarkers = 0;
    let totalAtoms = 0;

    grid.forEach((row) => {
      row.forEach((cell) => {
        if (cell.type === 'atomMarker') {
          if (cell.atom) totalAtoms++;
          if (cell.atom && cell.marker) {
            correctMarkers++;
          }
        }
      });
    });

    if (correctMarkers === totalAtoms && totalAtoms > 0) {
      setValidationResult('All atoms found! You win!');
    } else {
      setValidationResult(
        `${correctMarkers} out of ${totalAtoms} atoms found.`
      );
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
        {validationResult && <p>{validationResult}</p>}
        <button onClick={validateMarkers}>Validate</button>
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
                  {isLaser
                    ? cell.number
                    : hasMarker
                    ? 'M'
                    : hasMarker && shootMode
                    ? 'M'
                    : hasAtom
                    ? 'A'
                    : ''}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </>
  );
}
