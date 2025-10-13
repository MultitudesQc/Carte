"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useMap } from 'react-leaflet/hooks'
import EventPopup from "./EventPopup"

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

export type MultitudesEvent = {
  id: string
  createdTime: string
  fields: {
    "Nom de l'événement": string
    Date: string
    "Type d'événement": string
    "Hôte·sse": string[]
    "Participant·es": string[]
    "Nombre de places pour le public ": number
    "Date de l'Assemblée": string
    Courriel: string
    "Code postal": string
    "Prénom Nom": string
    "Courriel de confirmation": string
    "Nombre de participant·es": number
    "Places restantes": number
    Praxis: boolean
    "En quelques mots, qu'est-ce qui vous motive à organiser une assemblée de cuisine?": string
    "Avez-vous déjà organisé ou participé à une assemblée de cuisine de Multitudes?": string
    "Description action": string
    "Action publique": boolean
    "Municipalité": string
    "Lien vers l'événement": string
    "Billeteries": string
  }
  coordinates: [lat: number, lon: number]
}

export default function Map() {
  const [markers, setMarkers] = useState<MultitudesEvent[]>([]);

  async function fetchMapData() {
    const response = await fetch(apiUrl);
    const {map: {data}} = await response.json();
    setMarkers(data);
  }

  let minLat = Infinity
  let maxLat = -Infinity
  let minLon = Infinity
  let maxLon = -Infinity
  const placemarks = markers.reduce<React.ReactNode[]>((acc, { id, fields: {
    "Nom de l'événement": eventName,
    "Date de l'Assemblée": dateAssemblee,
    "Places restantes": placesRestantes,
    "Municipalité": municipalite,
    "Description action": description,
    "Action publique": isPublic,
    "Lien vers l'événement": link,
    "Billeteries": billeterie,
  }, coordinates }) => {
    if (coordinates) {
      const [lat, lon] = coordinates
      if (lat !== null && lon !== null) {
        minLat = Math.min(minLat, lat)
        maxLat = Math.max(maxLat, lat)
        minLon = Math.min(minLon, lon)
        maxLon = Math.max(maxLon, lon)
        acc.push(
          <Marker key={`marker-${id}`} position={[lat, lon]}>
            <Popup>
              <EventPopup
                eventName={eventName}
                dateAssemblee={dateAssemblee}
                municipalite={municipalite}
                description={description}
                isPublic={isPublic}
                link={link}
                billeterie={billeterie}
                placesRestantes={placesRestantes}
              />
            </Popup>
          </Marker>
        )
      }
    }
    return acc
  }, [])

  return (
    <div style={{ height: "500px", width: "100%" }}>
      <MapContainer
        center={[46.7, -71.4]}
        zoom={2}
        style={{ height: "100%", width: "100%" }}
        whenReady={async () => {
          await patchMarkerIcons()
          await fetchMapData()
        }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
        />
        <ViewManager bounds={[[minLat, minLon], [maxLat, maxLon]]} />
        {placemarks}
      </MapContainer>
    </div>
  );
}

function ViewManager ({ bounds: [[minLat, minLon], [maxLat, maxLon]] }: { bounds: [[number, number], [number, number]] }) {
  const map = useMap()
  if (minLat !== Infinity && maxLat !== -Infinity && minLon !== Infinity && maxLon !== -Infinity) {
    map.flyToBounds([[minLat, minLon], [maxLat, maxLon]])
  }
  return null
}
async function patchMarkerIcons() {
  const L = await import("leaflet");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}
