import type { Department, Subject } from "../types";
import http from "./http";

export async function fetchAllDepartments(): Promise<Department[]> {
  return http.get<Department[]>("/departments");
}

export async function fetchAllSubjects(): Promise<Subject[]> {
  return http.get<Subject[]>("/subjects/all");
}

export async function fetchDepartmentWithSubjects(
  department: number,
): Promise<Department> {
  const [dept, subjects] = await Promise.all([
    http.get<Department>(`/departments/${department}`),
    http.get<Subject[]>(`/subjects/${department}/subjects`),
  ]);
  return {
    ...dept,
    subjects,
  };
}

export interface CreateSubjectInput {
  name: string;
  departmentId: number;
  level: number;
  studyplan?: string;
}

export async function createSubject(
  input: CreateSubjectInput,
): Promise<Subject> {
  return http.post<Subject>("/subjects", input);
}
