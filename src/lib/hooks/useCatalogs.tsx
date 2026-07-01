import { useEffect, useRef, useState } from "react";
import type { Department, Subject } from "../../types";
import {
  fetchAllDepartments,
  fetchDepartmentWithSubjects,
} from "../departments";

export default function useCatalogs() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  const cache = useRef(new Map<number, Subject[]>());

  async function selectDepartment(id: number) {
    if (cache.current.has(id)) {
      setSubjects(cache.current.get(id)!);
      return;
    }

    try {
      const department = await fetchDepartmentWithSubjects(id);

      const subjects = department.subjects ?? [];

      cache.current.set(id, subjects);
      setSubjects(subjects);
    } catch (error) {
      console.error(error);
      setSubjects([]);
    }
  }

  useEffect(() => {
    async function loadDepartments() {
      try {
        const departments = await fetchAllDepartments();

        setDepartments(departments);

        if (departments.length > 0) {
          await selectDepartment(departments[0].id);
        }
      } catch (error) {
        console.error(error);
        setDepartments([]);
      } finally {
        setLoading(false);
      }
    }

    void loadDepartments();
  }, []);

  return {
    departments,
    subjects,
    loading,
    selectDepartment,
  };
}
