import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table"
import {pastEventClassName, legend, iconUrl, iconClassNames} from "@/config.json"
import {cn} from "@/lib/utils"
import Image from "next/image"

const {past, future, type} = legend

export default function Page () {
  return (
    <>
      <h3>{legend.title}</h3>
      <Table>
        <TableHeader>
          <TableRow className='border-foreground'>
            <TableHead>{past}</TableHead>
            <TableHead>{future}</TableHead>
            <TableHead>{type}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Object.entries(iconClassNames).map(([key, value]) => (
            <TableRow key={key} className='border-foreground'>
              <TableCell>
                <Image src={iconUrl} alt={`Icône pour ${key}`} width={25} height={41} className={cn(pastEventClassName, value)} />
              </TableCell>
              <TableCell>
                <Image src={iconUrl} alt={`Icône pour ${key}`} width={25} height={41} className={value} />
              </TableCell>
              <TableCell>{key}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
}
