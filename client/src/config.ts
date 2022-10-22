// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'lecabt8jj8'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map. For example:
  // domain: 'dev-nd9990-p4.us.auth0.com',
  domain: 'dev-quh6ctpwtquwx3t1.us.auth0.com',            // Auth0 domain
  clientId: 'IsIpgP3hN8tBvd6W9Df4a8F2wuVerNYu',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
