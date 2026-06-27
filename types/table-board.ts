import { Table, TableDm } from "./table";

// board
export type TableBoard = Table & {
  dm: TableDm;
  activeMemberCount: number;
};
