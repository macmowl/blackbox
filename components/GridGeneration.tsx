'use client';

import { loadGameState, saveGameState } from '@/app/actions';
import { AtomMarkerCell, GridWithLasers, LaserCell } from '@/app/types';
import { GRID_SIZE, cn, isRayReflected } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { Button } from './ui/button';

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

  // const getLaserNumber = (row: number, col: number): number | null => {
  //   if (row === 0) return (grid[row][col] as LaserCell).number; // Haut
  //   if (row === GRID_SIZE + 1) return col; // Bas
  //   if (col === 0) return GRID_SIZE + 1 + row; // Gauche
  //   if (col === GRID_SIZE + 1) return GRID_SIZE + 1 + row; // Droite
  //   return null;
  // };

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

    const isAdjacentToEdge = (r: number, c: number) =>
      (r === 1 && startRow === 0) ||
      (r === GRID_SIZE && startRow === GRID_SIZE + 1) ||
      (c === 1 && startCol === 0) ||
      (c === GRID_SIZE && startCol === GRID_SIZE + 1);

    const adjacentCells = [
      [row - 1, col + 1], // Haut
      [row + 1, col - 1], // Bas
      [row - 1, col - 1], // Gauche
      [row + 1, col + 1], // Droite
    ];

    for (const [adjRow, adjCol] of adjacentCells) {
      if (
        adjRow >= 0 &&
        adjRow <= GRID_SIZE + 1 &&
        adjCol >= 0 &&
        adjCol <= GRID_SIZE + 1 &&
        grid[adjRow][adjCol].type === 'atomMarker' &&
        (grid[adjRow][adjCol] as AtomMarkerCell).atom &&
        isAdjacentToEdge(adjRow, adjCol)
      ) {
        return `Reflected back`;
      }
    }

    while (steps < MAX_STEPS) {
      row += direction[0];
      col += direction[1];
      steps += 1;

      if (
        row <= 0 ||
        row >= GRID_SIZE + 1 ||
        col <= 0 ||
        col >= GRID_SIZE + 1
      ) {
        return `Ray exited at laser ${(grid[row][col] as LaserCell).number}`;
      }

      const cell = grid[row][col];
      if (cell.type === 'atomMarker' && cell.atom) {
        // return `Ray reflected back at (${startRow}, ${startCol})`;
        return 'HIT';
      }

      // Vérifier la présence d'atomes adjacents pour dévier le rayon
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
        // direction = [-direction[0], -direction[1]];
        return 'Double Deflection';
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

      // if (isRayReflected(row, col, grid)) {
      //   return `Ray reflected back`;
      // }
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

  const placeAtomsRandomly = () => {
    const newGrid = grid.map((row) =>
      row.map((cell) =>
        cell.type === 'atomMarker' ? { ...cell, atom: false } : cell
      )
    );

    let placedAtoms = 0;
    while (placedAtoms < 5) {
      const randomRow = Math.floor(Math.random() * GRID_SIZE) + 1;
      const randomCol = Math.floor(Math.random() * GRID_SIZE) + 1;

      if (!(newGrid[randomRow][randomCol] as AtomMarkerCell).atom) {
        newGrid[randomRow][randomCol] = {
          ...newGrid[randomRow][randomCol],
          atom: true,
        } as AtomMarkerCell;
        placedAtoms++;
      }
    }

    setGrid(newGrid);
    setAtomCount(5);
    saveGameState(newGrid);
    setShootMode(true);
  };

  const resetGame = () => {
    const emptyGrid = grid.map((row) =>
      row.map((cell) => {
        if (cell.type === 'laser') {
          return { ...cell, used: false };
        } else if (cell.type === 'atomMarker') {
          return { ...cell, atom: false, marker: false };
        }
        return cell;
      })
    );

    setGrid(emptyGrid);
    setAtomCount(0);
    setMarkerCount(0);
    setRayResult(null);
    setValidationResult(null);
    saveGameState(emptyGrid);
  };

  return (
    <>
      <div className='flex flex-col gap-2 justify-center'>
        <Button onClick={placeAtomsRandomly}>Start Solo Game</Button>
        <Button variant='ghost' onClick={() => setShootMode(!shootMode)}>
          {shootMode ? 'Switch to Place Atoms' : 'Switch to Shoot Rays'}
        </Button>
        <Button variant='ghost' onClick={resetGame}>
          Reset Game
        </Button>{' '}
        {/* Nouveau bouton de réinitialisation */}
        <div className='flex w-full gap-2 items-center justify-between'>
          <p>Atoms placed: {atomCount} / 5</p>
          {rayResult && <p>{rayResult}</p>}
          {validationResult && <p>{validationResult}</p>}
          <Button variant='secondary' onClick={validateMarkers}>
            Validate
          </Button>
        </div>
      </div>
      <div className='p-4 flex flex-col gap-2 rounded-md'>
        {grid.map((row, rowIndex) => (
          <div key={rowIndex} className='flex gap-2'>
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
