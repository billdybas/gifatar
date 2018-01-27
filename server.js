const envalid = require('envalid')
const Twit = require('twit')

const { str, num, bool } = envalid

const oneMinuteInMilliseconds = 60000

const env = envalid.cleanEnv(process.env, {
  TWITTER_CONSUMER_KEY: str(),
  TWITTER_CONSUMER_SECRET: str(),
  TWITTER_ACCESS_TOKEN: str(),
  TWITTER_ACCESS_TOKEN_SECRET: str(),
  TWITTER_TIMEOUT: num({ default: oneMinuteInMilliseconds }), // In milliseconds
  IMAGE_UPDATE_INTERVAL: num({ default: 60 }), // In minutes
  VERBOSE: bool({ default: false })
})

const T = new Twit({
  consumer_key: env.TWITTER_CONSUMER_KEY,
  consumer_secret: env.TWITTER_CONSUMER_SECRET,
  access_token: env.TWITTER_ACCESS_TOKEN,
  access_token_secret: env.TWITTER_ACCESS_TOKEN_SECRET,
  timeout_ms: env.TWITTER_TIMEOUT
})

function update (image) {
  T.post('account/update_profile_image', {
    image,
    skip_status: true
  }).then(({ data }) => {
    if (env.VERBOSE) {
      console.log(`${new Date().toString()}: Profile image updated to ${data.profile_image_url_https}`)
    }
  }).catch((err) => {
    console.error(`${new Date().toString()}: An error occurred when updating the profile image`)
    console.error(err)
  })
}

setInterval(update, oneMinuteInMilliseconds * env.IMAGE_UPDATE_INTERVAL) // TODO: Pass in image as arg
