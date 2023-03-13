// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'g44drmvwfj'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {

  domain: 'dev-nvonauw42cimse0r.us.auth0.com',            // Auth0 domain
  clientId: 't4aorhXOLllSDzZuGHciSfQh4MjHscQp',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
