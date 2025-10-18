"use client";

import {useState} from "react"
import { useMap } from 'react-leaflet/hooks'
import {icon, Icon} from 'leaflet'
import {MapContainer, TileLayer, Marker, Popup} from 'react-leaflet'

import {CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card"
import {Badge} from "@/components/ui/badge"
import {ButtonGroup} from "@/components/ui/button-group"
import {Button} from "@/components/ui/button"
import {Item, ItemContent, ItemTitle, ItemMedia} from "@/components/ui/item"
import {MapPinIcon} from '@/components/ui/icons/lucide-map-pin'

import strings from "@/strings.json"
import {initialMap, contactFormUrl, inscriptionFormUrl, iconUrl, iconRetinaUrl, shadowUrl, pastEventClassName, iconClassNames} from "@/config.json"
import {cn} from "@/lib/utils"

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

const markerIconOptions = {
  ...Icon.Default.prototype.options,
  iconUrl,
  iconRetinaUrl,
  shadowUrl
}

const icons: Record<string, Icon> = {
  default: icon(markerIconOptions)
}

Object.entries(iconClassNames).forEach(([key, value]) => {
  icons[key] = icon({
    ...markerIconOptions,
    className: value
  })
})

const pastIcons: Record<string, Icon> = {
  default: icon({
    ...markerIconOptions,
    className: pastEventClassName
  })
}

Object.entries(iconClassNames).forEach(([key, value]) => {
  pastIcons[key] = icon({
    ...markerIconOptions,
    className: cn(pastEventClassName, value)
  })
})

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
  const [markers, setMarkers] = useState<MultitudesEvent[]>([])
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  async function fetchMapData() {
    const response = await fetch(apiUrl);
    const {map: {data}, updated_at} = await response.json();
    setMarkers(data);
    setLastUpdated(new Date(updated_at))
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
          <Marker key={`marker-${id}`} position={[lat, lon]} icon={upcoming ? icons[eventType] || icons.default : pastIcons[eventType] || pastIcons.default}>
            <Popup>
              <CardHeader className="p-0">
                <Badge variant='secondary'>{actionPublique ? strings.evenementPublique : strings.evenementPrive}</Badge>
                {eventName && <CardTitle className='font-bold'>{eventName}</CardTitle>}
                {dateAssemblee && <span className='text-sm text-muted-foreground'>{dateAssemblee}</span>}
              </CardHeader>
              <CardContent className="p-0">
                {description && <CardDescription className='text-accent-foreground'>{description}</CardDescription>}
                {eventType === "Assemblée de cuisine" && upcoming && <p className='text-sm text-muted-foreground'>{strings.nbPlaces}: {placesRestantes}</p>}
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
                  <ButtonGroup orientation="vertical" className="w-full">
                    {lien && (
                      <Button asChild variant='secondary'>
                        <a href={lien} target="_blank">{strings.lienEvenement}</a>
                      </Button>
                    )}
                    {billeterie && (
                      <Button asChild className="text-primary-foreground!">
                        <a href={billeterie} target="_blank">{strings.billetterie}</a>
                      </Button>
                    )}
                    {actionPublique && courrielFourni && (
                      <Button asChild className="text-primary-foreground!">
                        <a href={contactFormUrl} target="_blank">{strings.contact}</a>
                      </Button>
                    )}
                    {eventType === "Assemblée de cuisine" && upcoming && (
                      <Button asChild className="text-primary-foreground!">
                        <a href={inscriptionFormUrl} target="_blank">{strings.inscription}</a>
                      </Button>
                    )}
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

  const dataDate = lastUpdated ? `${strings.lastUpdated}${lastUpdated.toISOString().split('T')[0]}` : ''

  return (
    <div style={{height: "100vh", width: "100%"}}>
      <MapContainer
        center={initialMap.center as [number, number]}
        zoom={initialMap.zoom}
        style={{ height: "100%", width: "100%" }}
        whenReady={async () => {
          await fetchMapData()
        }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution={`&copy; <a href="https://openstreetmap.org">OpenStreetMap</a><br />${dataDate}`}
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
