export type AtomMarkerCell = {
  type: 'atomMarker';
  atom: boolean;
  marker: boolean;
};

  type LaserCell = {
    type: 'laser';
    number: number | null;
    used: boolean;
  };

export type Cell = AtomMarkerCell | LaserCell;
export type GridWithLasers = (Cell)[][]