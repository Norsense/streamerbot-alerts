/*
eventResponseStructure structure:
[key as combination of event.source and event.type e.g "Twitch.Cheer"]: {
    title: [],
    message: [],
    // image and sound arrays take strings pointing to a local file location
    images?: [], // if no images, nothing displayed
    sounds?: [], // if no sounds, no sounds played
    duration?: 0 // miliseconds, defaults to 5000 if not set
}

additionally
- textToSpeech: for any event with a message
- tts: if you want to override any of your global tts settings (only matters for anything with textToSpeech enabled)
- anonTitle: for any event that has `isAnonymous` flag
- anonMessage: for any event that has `isAnonymous` flag
- showUserMessage: for any event with a user message that you want to display _instead_ of your message
- showProfileImage :for any event with a profileImage (Raids) that you want to display _instead_ of your image
- primeMessage: for any sub event where the subTier exists and is 0 (prime)
- variants: exist for the following events: Cheer, Raid, ReSub, GiftSub, GiftBomb.
  Variants support exact matches (e.g. 100), ranges (100-200), and multiples (x100). Variants will override
  whatever key/values you put in there over the base event shape
*/

// By default all alerts will display for 5 seconds before fading out
const defaultEventDisplayTime = 5000
const enableTTS = false // if false no TTS regardless of settings
const supressGiftBombSubEvents = true

// if DEBUG_MODE is set to true, events will be emitted into the console. This is useful if
// you're customizing your events, and want to see what data is sent with any given event.
const DEBUG_MODE = true

// look at https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis for more info on TTS props and voices
const defaultTTSSettings = {
  amountThreshold: 100, // only applies to Twitch.Cheer, KoFi.Donation, and KoFi.ShopOrder events currently
  delay: 1000,
  pitch: 1,
  rate: 1.3,
  voice: 'Zira',
  volume: 1
}

// CSS variable settings

// If you want to use these overrides, set this to true
const useCSSVariables = false
// color of message
const primaryTextColor = '#ffffff'
// color of alert title
const titleColor = '#00eeae'
// text shadow applied to both message and title
const textShadow =
  '0px 0px 2px rgba(0, 0, 0, 0.85), 0px 0px 4px rgba(0, 0, 0, 0.7)'
// the fonts you want to use. These fonts need to be installed on your system if you want them to work.
const fontStack = "'Montserrat-optimized', Monserrat, Verdana, sans-serif"
// how fast the alert should animate in
const animateInSpeed = '2s'
// how fast the alert should animate out
const animateOutSpeed = '2s'
// how fast the image of the alert should animate in
const imgAnimateInSpeed = '2.5s'
// how fast the image of the alert should animate out
const imgAnimateOutSpeed = '2.5s'

const eventResponseStructure = {
  // https://docs.streamer.bot/api/servers/websocket/events/twitch#follow
  'Twitch.Follow': {
    username: ['{user_name}'],
    title: ['New Follower'],
    message: ['Welcome '],
    images: ['videos/cheer-1.webm'],
    sounds: ['sounds/alert-follow.mp3'],
    duration: 8000
  },
  // https://docs.streamer.bot/api/servers/websocket/events/twitch#cheer
  'Twitch.Cheer': {
    username: ['{user.name}'],
    title: [' gave bits!'],
    anonTitle: ['Bits!'],
    message: ['Thanks for the {bits} bits, {user.name}'],
    anonMessage: ['Thanks for the {bits} bits, anonymous patron!'],
    images: ['videos/cheer-1.webm'],
    sounds: ['sounds/alert-cheer.mp3'],
    showUserMessage: true,
    duration: 4000,
    textToSpeech: true,
    exclusions: [],
    tts: {
      delay: 3000
    },
    variants: {
      69: {
        images: ['videos/cheer-69.webm']
      },
      500: {
        images: ['videos/cheer-disappear.webm']
      },
      '200-299': {
        images: ['videos/cheer-1Pommes.webm']
      },
      '300-499': {
        images: ['videos/cheer-schlick.webm']
      },
      '501-749': {
        images: ['videos/cheer-5Pommes.webm']
      },
      '750-799': {
        images: ['videos/cheer-MEEP.webm']
      },
      '800-999': {
        images: ['videos/cheer-Wag.webm']
      },
      '1000-2000': {
        images: ['videos/cheer-DogFight.webm']
      },
      '>10000': {
        images: ['videos/cheer-BallRain.webm']
      }
    }
  },
  // https://docs.streamer.bot/api/servers/websocket/events/twitch#raid
  'Twitch.Raid': {
    username: ['{from_broadcaster_user_name}'],
    title: [' is here!'],
    message: ['Welcome!', 'Hello raiders!'],
    images: ['videos/raid.webm'],
    sounds: ['sounds/alert-raid.mp3'],
    showProfileImage: true,
    duration: 8000
  },
  // https://docs.streamer.bot/api/servers/websocket/events/twitch#sub
  'Twitch.Sub': {
    username: ['{user.name}!'],
    title: ['New Subscriber'],
    message: [' just subscribed!'],
    primeMessage: ['Thanks for the Twitch Prime sub '],
    images: ['videos/sub-tier_1.webm'],
    sounds: ['sounds/alert-sub-tier-1.mp3'],
    showUserMessage: true,
    duration: 10000,
    variants: {
      2000: {
        images: ['images/sub-tier-2.webp'],
        sounds: ['sounds/alert-sub-tier-2.mp3'],
        message: [' just subscribed with tier 2!']
      },
      3000: {
        images: ['images/sub-tier-3.webp'],
        sounds: ['sounds/alert-sub-tier-3.mp3'],
        message: [' just subscribed with tier 3!']
      }
    }
  },
  // https://docs.streamer.bot/api/servers/websocket/events/twitch#resub
  'Twitch.ReSub': {
    username: ['{user.name}'],
    title: ['{user.name} Resubscribed!'],
    message: ['Thanks for the {cumulativeMonths} months, {user.name}!'],
    primeMessage: [
      'Thanks for resubbing with your Twitch Prime sub {user.name}!'
    ],
    images: ['videos/sub-tier_1.webm'],
    sounds: ['sounds/alert-sub-tier-1.mp3'],
    showUserMessage: true,
    duration: 10000,
    variants: {
      2000: {
        images: ['images/sub-tier-2.webp'],
        sounds: ['sounds/alert-sub-tier-2.mp3'],
        title: ['{user.name} Resubscribed with tier 2!']
      },
      3000: {
        images: ['images/sub-tier-3.webp'],
        sounds: ['sounds/alert-sub-tier-3.mp3'],
        title: ['{user.name} Resubscribed with tier 3!']
      }
    }
  },
  // https://docs.streamer.bot/api/servers/websocket/events/twitch#gift-sub
  'Twitch.GiftSub': {
    username: ['{user.name}'],
    title: ['{recipient.name} was gifted a sub'],
    anonTitle: ['{recipient.name} was gifted a sub'],
    message: ['Thanks for the gift sub, {user.name}'],
    anonMessage: ['Thanks for the gift sub, anonymous patron!'],
    primeMessage: ['There are prime gift subs?!'],
    images: ['videos/sub-tier_1.webm'],
    sounds: ['sounds/alert-sub-tier-1.mp3'],
    duration: 10000,
    variants: {
      2000: {
        images: ['videos/sub-tier-2.webp'],
        sounds: ['sounds/alert-sub-tier-2.mp3']
      },
      3000: {
        images: ['videos/sub-tier-3.webp'],
        sounds: ['sounds/alert-sub-tier-3.mp3']
      }
    }
  },
  // https://docs.streamer.bot/api/servers/websocket/events/twitch#gift-bomb
  'Twitch.GiftBomb': {
    username: ['{user.name}'],
    title: [' gifted {gifts} subs'],
    anonTitle: ['{gifts} subs have been gifted'],
    message: ['Thanks for the subs!'],
    anonMessage: ['Thanks for the {gifts} subs!'],
    primeMessage: ['There are prime gift subs?!'],
    images: ['videos/sub-1.webm'],
    sounds: ['sounds/alert-sub-1.mp3'],
    duration: 10000,
    variants: {
      '5-9': {
        images: ['videos/sub-2.webm'],
        sounds: ['sounds/alert-sub-tier-2.mp3']
      },
      '10-19': {
        images: ['videos/sub-tier-3.webp'],
        sounds: ['sounds/alert-sub-tier-3.mp3']
      },
      '>20': {
        images: ['videos/sub-5.webm'],
        sounds: ['sounds/alert-sub-5.mp3']
      }
    }
  },

  /*
  // KoFi event structure as filtered through StreamerBot
  {
        "messageId": string,
        "timestamp": Datetime UTC stamp,
        "from": string,
        "isPublic": boolean,
        "message": string,
        "amount": string (float?),
        "currency": string,
        "tier": string, // Resubscription event only, possibly Subscription (need confirmation)
        "items": string[] // ShopOrder event only
    }
  */
  'Kofi.Donation': {
    title: ['{from} donated {amount} {currency}!'],
    anonTitle: ['Someone donated {amount} {currency}!'],
    message: ['Thanks {from} for the donation!'],
    anonMessage: ['Thanks for the donation, mysterious stranger!'],
    images: ['images/sub-1.webp'],
    sounds: ['sounds/alert-sub.mp3'],
    textToSpeech: true,
    showUserMessage: true,
    exclusions: [],
    variants: []
  },
  'Kofi.Subscription': {
    title: ['{from} has subscribed!'],
    message: ['Thanks {from} for subscribing on KoFi!'],
    images: ['images/sub-1.webp'],
    sounds: ['sounds/alert-sub.mp3'],
    textToSpeech: true,
    showUserMessage: true,
    exclusions: [],
    variants: []
  },
  'Kofi.Resubscription': {
    title: ['{from} has resubscribed!'],
    message: ['Thanks {from} for the continued support!'],
    images: ['images/sub-1.webp'],
    sounds: ['sounds/alert-sub.mp3'],
    textToSpeech: true,
    showUserMessage: true,
    exclusions: [],
    variants: []
  },
  'Kofi.ShopOrder': {
    title: ['{from} bought some stuff!'],
    message: ['Thanks {from} for the purchase!'],
    images: ['images/sub-1.webp'],
    sounds: ['sounds/alert-sub.mp3'],
    textToSpeech: true,
    showUserMessage: true,
    exclusions: [],
    variants: []
  }
}
