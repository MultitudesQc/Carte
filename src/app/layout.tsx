import "leaflet/dist/leaflet.css"
import "./globals.css";
import {bodyClassName} from "@/config.json"

export default function RootLayout ({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body className={bodyClassName}>{children}</body>
    </html>
  );
}
