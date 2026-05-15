type MapPreviewProps = {
  location: string
  title?: string
  height?: number
}

export function MapPreview({ location, title = 'Map preview', height = 280 }: MapPreviewProps) {
  const query = encodeURIComponent(location)
  const src = `https://www.google.com/maps?q=${query}&output=embed`
  const link = `https://www.google.com/maps/search/?api=1&query=${query}`

  return (
    <section className="map-preview" aria-label={title}>
      <div className="map-preview__header">
        <div>
          <p className="map-preview__eyebrow">Location</p>
          <h3>{title}</h3>
        </div>
        <a href={link} target="_blank" rel="noreferrer">Open in Maps</a>
      </div>
      <iframe title={title} src={src} style={{ height }} loading="lazy" />
    </section>
  )
}
