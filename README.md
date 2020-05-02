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

#### Firebase: Authentication

We use Firebase for GitHub authentication:

1. [Create a new GitHub OAuth app](https://github.com/settings/applications/new). GitHub will ask you to provide _Authorization callback URL_.
2. [Create a new Firebase account](https:///firebase.google.com).
3. Go to Authentication and enable GitHub sign-in. Copy _Authorization callback URL_.
4. Go to Github and finalize app creation by providing _Authorization callback URL_.
5. Copy _Client ID_ and _Client Secret_.
6. Go to Firebase and provide those values.

#### Firebase: Connect

1. Open your Firebase account
2. Generate a new private key under Service accounts panel
3. Store downloaded credentials under `devevents-api/firebase.credentials.json`.
4. Create `devevents-web/firebase.auth.json` file with and populate it with the content:

```json
{
  "projectId": "<firebase projectId>",
  "apiKey": "<firebase apiKey>",
  "authDomain": "<firebase projectId>.firebaseapp.com",
  "databaseURL": "https://<firebase projectId>.firebaseio.com"
}
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

### Run tests

```bash
  npm test
```
