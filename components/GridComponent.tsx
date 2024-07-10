// import React from 'react';
// import { GridWithLasers } from '@/app/types';
// import CellComponent from './CellComponent';

// interface GridProps {
//   grid: GridWithLasers;
//   shootMode: boolean;
//   handleCellClick: (row: number, col: number) => void;
// }

// const GridComponent: React.FC<GridProps> = ({
//   grid,
//   shootMode,
//   handleCellClick,
// }) => {
//   return (
//     <div className='border border-gray-700 p-4 flex gap-4'>
//       {grid.map((row, rowIndex) => (
//         <div key={rowIndex} className='flex flex-col gap-4'>
//           {row.map((cell, colIndex) => (
//             <CellComponent
//               key={colIndex}
//               cell={cell}
//               rowIndex={rowIndex}
//               colIndex={colIndex}
//               shootMode={shootMode}
//               handleCellClick={handleCellClick}
//             />
//           ))}
//         </div>
//       ))}
//     </div>
//   );
// };

// export default GridComponent;
