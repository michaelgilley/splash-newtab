
const FETCH_URL = 'https://api.unsplash.com/photos/random?orientation=landscape&featured&query=nature&count=5'
const CLIENT_ID = ''
const IMAGES = []
const req = {
  promise: Promise.resolve(),
}

function warmCache () {
  const img = IMAGES[0]
  if (!img) return;
  const i = new Image()
  i.src = img.url
}

function makeRequest () {
  console.log('Ext Splash-Newtab: making request')
  req.promise = new Promise(async (resolve) => {
    const res = await fetch(FETCH_URL, {
      headers: {
        Authorization: `Client-ID ${CLIENT_ID}`
      }
    })
    const json = await res.json()
    const imgs = json.map(({
      color, 
      urls: { full: url },
      location,
      exif,
    }) => ({ color, url, location, exif }))
    IMAGES.push(...imgs)
    warmCache()
    resolve(imgs)
  })
  return req.promise
}

const handleMessage = app => async ({ type }) => {
  switch(type) {
    case 'GET_IMAGE':
      if (!IMAGES.length) await req.promise
      app.postMessage({ type: 'IMAGE', payload: IMAGES.shift() })
      warmCache()
      if (IMAGES.length === 2) {
        makeRequest()
      }
      break
    default:
  }
}

browser.runtime.onConnect.addListener(app => {
  if (app.name === 'splash-newtab') {
    app.onMessage.addListener(handleMessage(app))
  }
})

makeRequest()
