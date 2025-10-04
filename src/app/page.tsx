// src/app/page.tsx
import Map from "../components/Map";

export default function Home() {
  return (
    <main className="p-4">
      <h1 className="text-xl mb-4">Assemblées de cuisine</h1>
      <Map />
    </main>
  );
}
