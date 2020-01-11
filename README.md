[![Build Status](https://travis-ci.org/unicorncoding/devevents-api.svg?branch=master)](https://travis-ci.org/unicorncoding/devevents-api)
# dev.events API

```
api.dev.events
```

👩‍💻 Written in JavaScript. 

🚀 Deployed to Cloud Functions.

🌎 Accessible over HTTP.

⏰ Triggered when necessary via Cloud Scheduler.

### Running in dev mode

Put the following `.envrc` file in project's root directory:

```
export MODE=dev
export GOOGLE_APPLICATION_CREDENTIALS="$PWD/.gcloud-dev.json"
```

In order to run the project locally, please ask the project owner to create your personal Google Service Account. Then put your credentials in the project directory under name `.gcloud-dev.json` 

Install dependencies:
```
npm install
```

Run dev server:
```
npm run dev
```