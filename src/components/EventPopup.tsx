import {CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card"
import {Badge} from "@/components/ui/badge"
import {ButtonGroup, ButtonGroupSeparator} from "@/components/ui/button-group"
import {Button} from "@/components/ui/button"
import {Item, ItemContent, ItemDescription, ItemMedia} from "@/components/ui/item"
import { MapPinIcon } from '@/components/ui/icons/lucide-map-pin'

export type EventPopupProps = {
  eventName: string
  dateAssemblee: string
  municipalite: string
  description: string
  isPublic: boolean
  link?: string
  billeterie?: string
  placesRestantes: number
}

export default function EventPopup({
  eventName,
  dateAssemblee,
  municipalite,
  description,
  isPublic,
  link,
  billeterie,
  placesRestantes
}: EventPopupProps) {
  return (
    <>
      <CardHeader className="p-0">
        { eventName && <CardTitle className='font-bold'>{eventName}</CardTitle>}
        {dateAssemblee && <p className='text-sm text-muted-foreground'>{dateAssemblee}</p>}
        <Badge>{isPublic ? "Publique" : "Privé"}</Badge>
      </CardHeader>
      <CardContent className="p-0">
        {description && <CardDescription className='text-accent-foreground'>{description}</CardDescription>}
        {placesRestantes && <p className='text-sm text-muted-foreground'>Places restantes: {placesRestantes}</p>}
        {municipalite && <Item>
          <ItemMedia>
            <MapPinIcon />
          </ItemMedia>
          <ItemContent>
            <ItemDescription>{municipalite}</ItemDescription>
          </ItemContent>
        </Item>}
      </CardContent>
      <CardFooter className="p-0">
        {(link || billeterie) && (
          <ButtonGroup>
            {link && <Button asChild><a href={link}>{"Voir l'événement"}</a></Button>}
            {link && billeterie && <ButtonGroupSeparator />}
            {billeterie && <Button asChild><a href={billeterie}>{"Billetterie"}</a></Button>}
          </ButtonGroup>
        )}
      </CardFooter>
    </>
  )
}