// import React from 'react';
// import { Cell } from '@/app/types';
// import { cn } from '@/lib/utils';

// interface CellProps {
//   cell: Cell;
//   rowIndex: number;
//   colIndex: number;
//   shootMode: boolean;
//   handleCellClick: (row: number, col: number) => void;
// }

// const CellComponent: React.FC<CellProps> = ({
//   cell,
//   rowIndex,
//   colIndex,
//   shootMode,
//   handleCellClick,
// }) => {
//   const isLaser = cell === 'laser';
//   const hasAtom = cell !== 'laser' && cell.atom;
//   const hasMarker = cell !== 'laser' && cell.marker;

//   return (
//     <div
//       onClick={() => handleCellClick(rowIndex, colIndex)}
//       className={cn(
//         'size-16 border border-gray-700 flex items-center justify-center cursor-pointer rounded-sm hover:bg-gray-300',
//         shootMode ? 'text-transparent' : '',
//         hasMarker ? 'text-gray-900' : '',
//         isLaser ? 'bg-red-300' : ''
//       )}
//     >
//       {hasAtom ? 'A' : hasMarker ? 'M' : null}
//     </div>
//   );
// };

// export default CellComponent;
