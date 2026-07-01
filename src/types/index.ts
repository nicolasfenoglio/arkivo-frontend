export type Note = {
  id: number;
  title: string;
  career: string;
  subject: string;
  author: string;
  rating: number;
  downloads: number;
};
export type Subject = {
  id: number;
  name: string;
  level: number;
  departmentid?: number;
};
export type Department = {
  id: number;
  name: string;
  subjects?: Subject[];
};
