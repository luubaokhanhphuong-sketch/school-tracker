import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api } from "@/lib/api";

const PlannerContext = createContext(null);

function useResource(initial) {
  const [state, setState] = useState({ data: initial, loading: true, error: null });
  return [state, setState];
}

export function PlannerProvider({ children }) {
  const [subjects, setSubjects] = useResource([]);
  const [assignments, setAssignments] = useResource([]);
  const [exams, setExams] = useResource([]);
  const [sessions, setSessions] = useResource([]);
  const [version, setVersion] = useState(0);
  const bump = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    let alive = true;
    api
      .get("/subjects/")
      .then((d) => alive && setSubjects({ data: d, loading: false, error: null }))
      .catch((e) => alive && setSubjects((s) => ({ ...s, loading: false, error: e.message })));
    return () => (alive = false);
  }, [version, setSubjects]);

  useEffect(() => {
    let alive = true;
    api
      .get("/assignments/")
      .then((d) =>
        alive && setAssignments({ data: d, loading: false, error: null })
      )
      .catch((e) =>
        alive && setAssignments((s) => ({ ...s, loading: false, error: e.message }))
      );
    return () => (alive = false);
  }, [version, setAssignments]);

  useEffect(() => {
    let alive = true;
    api
      .get("/exams/")
      .then((d) => alive && setExams({ data: d, loading: false, error: null }))
      .catch((e) => alive && setExams((s) => ({ ...s, loading: false, error: e.message })));
    return () => (alive = false);
  }, [version, setExams]);

  useEffect(() => {
    let alive = true;
    api
      .get("/sessions/")
      .then((d) => alive && setSessions({ data: d, loading: false, error: null }))
      .catch((e) =>
        alive && setSessions((s) => ({ ...s, loading: false, error: e.message }))
      );
    return () => (alive = false);
  }, [version, setSessions]);

  const runMutation = useCallback(
    async (fn) => {
      const result = await fn();
      bump();
      return result;
    },
    [bump]
  );

  const mutations = useMemo(
    () => ({
      createSubject: (payload) =>
        runMutation(() => api.post("/subjects/", payload)),
      updateSubject: (id, payload) =>
        runMutation(() => api.patch(`/subjects/${id}/`, payload)),
      deleteSubject: (id) => runMutation(() => api.delete(`/subjects/${id}/`)),

      createAssignment: (payload) =>
        runMutation(() => api.post("/assignments/", payload)),
      updateAssignment: (id, payload) =>
        runMutation(() => api.patch(`/assignments/${id}/`, payload)),
      deleteAssignment: (id) =>
        runMutation(() => api.delete(`/assignments/${id}/`)),

      createExam: (payload) => runMutation(() => api.post("/exams/", payload)),
      updateExam: (id, payload) =>
        runMutation(() => api.patch(`/exams/${id}/`, payload)),
      deleteExam: (id) => runMutation(() => api.delete(`/exams/${id}/`)),

      createSession: (payload) =>
        runMutation(() => api.post("/sessions/", payload)),
      updateSession: (id, payload) =>
        runMutation(() => api.patch(`/sessions/${id}/`, payload)),
      deleteSession: (id) =>
        runMutation(() => api.delete(`/sessions/${id}/`)),
    }),
    [runMutation]
  );

  const value = useMemo(
    () => ({
      subjects: subjects.data ?? [],
      assignments: assignments.data ?? [],
      exams: exams.data ?? [],
      sessions: sessions.data ?? [],
      loading: subjects.loading || assignments.loading || exams.loading || sessions.loading,
      version,
      ...mutations,
    }),
    [subjects, assignments, exams, sessions, version, mutations]
  );

  return (
    <PlannerContext.Provider value={value}>{children}</PlannerContext.Provider>
  );
}

export function usePlanner() {
  const ctx = useContext(PlannerContext);
  if (!ctx) throw new Error("usePlanner must be used within PlannerProvider");
  return ctx;
}

export function useFetch(path, deps) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  useEffect(() => {
    let alive = true;
    setState({ data: null, loading: true, error: null });
    api
      .get(path)
      .then((d) => alive && setState({ data: d, loading: false, error: null }))
      .catch((e) =>
        alive && setState({ data: null, loading: false, error: e.message })
      );
    return () => (alive = false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, ...(deps || [])]);
  return state;
}