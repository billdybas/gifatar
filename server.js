const fs = require('fs')

const Promise = require('bluebird')
const envalid = require('envalid')
const gif = require('gif-frames')
const mkdirp = require('mkdirp')
const rmrf = require('rimraf')
const Twit = require('twit')

const { str, num, bool } = envalid

const oneMinuteInMilliseconds = 60 * 1000

const env = envalid.cleanEnv(process.env, {
  TWITTER_CONSUMER_KEY: str(),
  TWITTER_CONSUMER_SECRET: str(),
  TWITTER_ACCESS_TOKEN: str(),
  TWITTER_ACCESS_TOKEN_SECRET: str(),
  TWITTER_TIMEOUT: num({ default: oneMinuteInMilliseconds }), // In milliseconds
  IMAGE_UPDATE_INTERVAL: num({ default: 60 }), // In minutes
  IMAGE_PATH: str(), // Relative to images/
  VERBOSE: bool({ default: false }),
  NODE_ENV: str({ default: 'development' })
})

const T = new Twit({
  consumer_key: env.TWITTER_CONSUMER_KEY,
  consumer_secret: env.TWITTER_CONSUMER_SECRET,
  access_token: env.TWITTER_ACCESS_TOKEN,
  access_token_secret: env.TWITTER_ACCESS_TOKEN_SECRET,
  timeout_ms: env.TWITTER_TIMEOUT
})

const pmkdirp = Promise.promisify(mkdirp)
const prmrf = Promise.promisify(rmrf)
const preadFile = Promise.promisify(fs.readFile)

async function processGIF () {
  const frameDir = `${__dirname}/images/frames/`
  await prmrf(frameDir) // Remove any previously generated frames
  await pmkdirp(frameDir) // Make a new frame directory

  // Convert the GIF to frames
  return gif({url: `${__dirname}/images/${env.IMAGE_PATH}`, frames: 'all'})
    // Write each frame to disk
    .then((frameData) => {
      const fileNames = frameData.map((frame) => {
        const fileName = `${frameDir}/frame-${frame.frameIndex}.jpg`
        const stream = frame.getImage().pipe(fs.createWriteStream(fileName))
        const onFinish = new Promise((resolve) => {
          stream.on('finish', () => {
            resolve(fileName)
          })
        })
        return Promise.resolve(onFinish)
      })
      return Promise.all(fileNames)
    })
    // Read each frame into memory
    .then((fileNames) => {
      const frameData = fileNames.map((fileName) => {
        return preadFile(fileName)
          .then((data) => {
            // Twitter wants the image Base64 encoded
            return Buffer.from(data).toString('base64')
          })
      })
      return Promise.all(frameData)
    })
}

async function update (image) {
  // "The avatar image for the profile, base64-encoded.
  // Must be a valid GIF, JPG, or PNG image of less than 700 kilobytes in size.
  // Images with width larger than 400 pixels will be scaled down.
  // Animated GIFs will be converted to a static GIF of the first frame, removing the animation."
  const { data } = await T.post('account/update_profile_image', { image, skip_status: true })
  if (env.VERBOSE) {
    console.log(`${new Date().toString()}: Profile image updated to ${data.profile_image_url_https}`)
  }
}

async function start () {
  let frames
  try {
    frames = await processGIF()
  } catch (err) {
    console.error('An error occurred when starting. Aborting.')
    console.error(err)
    process.exit(1)
  }

  let index = 0
  const getFrame = () => {
    const ret = index
    index = (index + 1) % frames.length // Cycle through the frames
    return frames[ret]
  }
  setInterval(() => {
    try {
      update(getFrame())
    } catch (err) {
      console.error(`${new Date().toString()}: An error occurred when updating the profile image`)
      console.error(err)
      // Rollback – we'll try setting it the next time around
      if (index === 0) {
        index = frames.length
      } else {
        index = index - 1
      }
    }
  }, oneMinuteInMilliseconds * env.IMAGE_UPDATE_INTERVAL)
}

start()
