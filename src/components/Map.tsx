"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useMap } from 'react-leaflet/hooks'

import {CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card"
import {Badge} from "@/components/ui/badge"
import {ButtonGroup} from "@/components/ui/button-group"
import {Button} from "@/components/ui/button"
import {Item, ItemContent, ItemTitle, ItemMedia} from "@/components/ui/item"
import {MapPinIcon} from '@/components/ui/icons/lucide-map-pin'

import strings from "@/strings.json"
import config from "@/config.json"

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
  fields: {
    "Nom de l'événement": string
    "Type d'événement": string
    "Nombre de places pour le public ": number
    "Date de l'Assemblée": string
    CourrielFourni: string
    "Places restantes": number
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

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const placemarks = markers.reduce<React.ReactNode[]>((acc, { id, fields: {
    "Nom de l'événement": eventName,
    "Type d'événement": eventType,
    "Date de l'Assemblée": dateAssemblee,
    "CourrielFourni": courrielFourni,
    "Places restantes": placesRestantes,
    "Municipalité": municipalite,
    "Description action": description,
    "Action publique": actionPublique,
    "Lien vers l'événement": lien,
    "Billeteries": billeterie,
  }, coordinates }) => {
    if (coordinates) {
      const [lat, lon] = coordinates
      if (lat !== null && lon !== null) {
        minLat = Math.min(minLat, lat)
        maxLat = Math.max(maxLat, lat)
        minLon = Math.min(minLon, lon)
        maxLon = Math.max(maxLon, lon)
        const eventDate = new Date(dateAssemblee)
        const upcoming = eventDate >= today
        acc.push(
          <Marker key={`marker-${id}`} position={[lat, lon]}>
            <Popup>
              <CardHeader className="p-0">
                {eventName && <CardTitle className='font-bold'>{eventName}</CardTitle>}
                {dateAssemblee && <p className='text-sm text-muted-foreground'>{dateAssemblee}</p>}
                <Badge>{actionPublique ? strings.evenementPublique : strings.evenementPrive}</Badge>
              </CardHeader>
              <CardContent className="p-0">
                {description && <CardDescription className='text-accent-foreground'>{description}</CardDescription>}
                {upcoming && <p className='text-sm text-muted-foreground'>{strings.nbPlaces}: {placesRestantes}</p>}
                {municipalite && (
                  <Item>
                    <ItemMedia>
                      <MapPinIcon />
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle>{municipalite}</ItemTitle>
                    </ItemContent>
                  </Item>
                )}
              </CardContent>
              <CardFooter className="p-0">
                {(lien || billeterie || courrielFourni) && (
                  <ButtonGroup orientation="vertical">
                    {lien && <Button asChild className="text-primary-foreground!">
                      <a href={lien}>{strings.lienEvenement}</a>
                    </Button>}
                    {billeterie && <Button asChild className="text-primary-foreground!">
                      <a href={billeterie}>{strings.billetterie}</a>
                    </Button>}
                    {actionPublique && courrielFourni && <Button asChild className="text-primary-foreground!">
                      <a href="https://airtable.com/appi9w1LESftOH4Lq/pagXpHGhPbYXIe6tK/form">{strings.contact}</a>
                    </Button>}
                    {eventType === "Assemblée de cuisine" && upcoming && <Button asChild className="text-primary-foreground!">
                      <a href="https://airtable.com/appi9w1LESftOH4Lq/pagmssydtpmpwV5hR/form">{strings.inscription}</a>
                    </Button>}
                  </ButtonGroup>
                )}
              </CardFooter>
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
        center={config.initialMap.center as [number, number]}
        zoom={config.initialMap.zoom}
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
