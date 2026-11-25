export type Task = {
  id: string;
  titulo: string;
  descricao?: string;
  dataCriacao: Date;
};

export type TaskPage = {
  items: Task[];
  nextCursor: string | null;
  total: number;
};
