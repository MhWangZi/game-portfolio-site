import { lazy, Suspense, useEffect, useState } from "react";
import { PersonalWorld } from "./avg/PersonalWorld";
import { useVisitCounter } from "./hooks/useVisitCounter";
const Admin = lazy(async () => {
  await import("./index.css");
  await import("./console.css");
  return import("./components/PseudoAdmin").then((m) => ({
    default: m.PseudoAdmin,
  }));
});
export default function App() {
  const [admin, setAdmin] = useState(location.hash === "#/admin");
  useVisitCounter(admin);
  useEffect(() => {
    const update = () => setAdmin(location.hash === "#/admin");
    addEventListener("hashchange", update);
    return () => removeEventListener("hashchange", update);
  }, []);
  return admin ? (
    <Suspense fallback={<p>正在接通终端…</p>}>
      <Admin />
    </Suspense>
  ) : (
    <PersonalWorld />
  );
}
