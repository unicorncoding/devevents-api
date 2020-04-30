[![Build Status](https://travis-ci.org/unicorncoding/devevents-api.svg?branch=master)](https://travis-ci.org/unicorncoding/devevents-api)
# dev.events API

```
api.dev.events
```

👩‍💻 Written in JavaScript. 

🚀 Deployed to Cloud Functions.

🌎 Accessible over HTTP.

⏰ Triggered when necessary via Cloud Scheduler.

## Running in dev mode

#### Install [Google Cloud SDK](https://cloud.google.com/sdk/install):

```bash
brew cask install google-cloud-sdk
```

#### Datastore: Download test data

```bash
gsutil cp -r gs://dev-events-data .
```
#### Datastore: Run emulator

```bash
# run emulator
gcloud beta emulators datastore start --project=dev-events

# point environment variables to the emulator
$(gcloud beta emulators datastore env-init)

# populate Datastore Emulator
curl -X POST localhost:8081/v1/projects/dev-events:import \
-H 'Content-Type: application/json' \
-d '{"input_url":"./dev-events-data/2020-04-30T12:18:56_61033/2020-04-30T12:18:56_61033.overall_export_metadata"}'
```

#### Run the app
```bash
npm install
npm run serve
```