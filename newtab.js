
const bg = document.getElementById('bg')
const connection = browser.runtime.connect({ name: 'splash-newtab' })

const makeRegion = (className, content) => {
  const region = document.createElement('div')
  region.classList.add(className)
  if (!content) return region
  if (typeof content === 'string') content = document.createTextNode(content)
  if (!Array.isArray(content)) content = [content]
  content.forEach(c => region.appendChild(c))
  return region
}

connection.onMessage.addListener(({ type, payload }) => {
  switch (type) {
    case 'IMAGE':
      document.body.style.backgroundColor = payload.color
      bg.style.backgroundImage = `url(${payload.url})`

      const photoLink = document.createElement('a')
      photoLink.classList.add('photo-link')
      photoLink.href = payload.link
      photoLink.target = '_blank'
      const location = makeRegion('location')
      const rightTray = makeRegion('right-tray', photoLink)

      const appendages = [location, rightTray]

      if (payload.location) {
        location.appendChild(document.createTextNode(payload.location.title))
      }

      if (payload.exif.model) {
        const { model, make } = payload.exif
        const contents = model.includes(make) ? model : `${make} ${model}`
        const exif = makeRegion('exif', contents)
        rightTray.insertBefore(exif, rightTray.firstChild)
      }

      const footerTarget = makeRegion('footer-target')
      const footer = makeRegion('footer', appendages)
      bg.appendChild(footerTarget)
      bg.appendChild(footer)

      const img = new Image()
      img.src = payload.url
      img.onload = () => {
        bg.classList.add('show')
      }
    break
    default:
  }
})

connection.postMessage({ type: 'GET_IMAGE' })
