# gifatar

A Twitter Bot for Slow GIF Avatars

## About

[Twitter doesn't let you make your avatar a GIF.](https://www.buzzfeed.com/katienotopoulos/the-real-reason-twitter-doesnt-allow-gif-avatars)

But that doesn't mean your avatar can't be "animated"!

With `gifatar`, you can have your avatar update like a GIF over an extended period of time. When you look at your profile, you see a different frame each time, much like seeing the hands of a clock be in a different position when you glance up after a few hours – a [slow web](https://jackcheng.com/the-slow-web/) experience.

## Run Your Own

1. Make sure you have `node` and `npm` installed.
2. Clone or fork this repo. `git clone https://github.com/billdybas/gifatar.git`
3. Make a `.env` file. `cp .env-sample .env`
4. Place the GIF you'd like to use in `images/`.
5. Create a new Twitter app at [https://apps.twitter.com/](https://apps.twitter.com/). Twitter will generate a Consumer Key and Consumer Secret. Make sure to also generate an Access Token and Access Token Secret at `https://apps.twitter.com/app/<app_id>/keys`. Put these in your `.env`.
6. Fill in the other appropriate environment variables:
  - `IMAGE_PATH`: (_string_, _required_) Path of the GIF to use relative to the `images/` directory
  - `TWITTER_TIMEOUT`: (_number_, _optional_, _default: 1 minute_) HTTP request timeout to Twitter
  - `IMAGE_UPDATE_INTERVAL`: (_number_, _optional_, _default: 60 minutes_) How often to update the profile image
  - `VERBOSE`: (_boolean_, _optional_, _default: false_) Whether to run in verbose mode
7. `npm start`

## Resources

- [Twitter's Rules & Best Practices](https://help.twitter.com/en/rules-and-policies/twitter-rules-and-best-practices)
- [Twitter's Automation Rules](https://help.twitter.com/en/rules-and-policies/twitter-automation)
- [Twitter's API Docs](https://developer.twitter.com/en/docs)
- [`POST account/update_profile_image` Docs](https://developer.twitter.com/en/docs/accounts-and-users/manage-account-settings/api-reference/post-account-update_profile_image)
- [How to Make a Twitter Bot](https://botwiki.org/tutorials/how-to-make-a-twitter-bot-definitive-guide/)

## License

See `LICENSE.md`

---

Built during [Brickhack 4](https://brickhack.io) by Bill Dybas.
