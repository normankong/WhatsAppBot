# WhatsApp Bot
Whatapps Bot via Twilio API

This is a google cloud function to send Whatapps message via Twilio API\
For detail on the API usage, please refer to https://www.twilio.com/whatsapp

## Feature Supports :
- Use Json Web Token(JWT) for authenication
- Support several template

### To Do ###
- Decouple the Message template to separate engine
- Support multiple whatapps account, currently hardcode 1 account via .env
- Multiple language support

## Sample .env file 
```
TWILIO_ACCOUNT_SID=AC4XXXXXXXXXXXXXXXXXXXXXXXX
TWILIO_ACCOUNT_AUTH=f493XXXXXXXXXXXXXXXXXXXX
TWILIO_FROM_ADDRESS=whatsapp:+XXXXXXXXXX
TWILIO_TO_ADDRESS=whatsapp:+XXXXXXXXXX

PRIVATE_KEY=key/private_key.pem
PUBLIC_KEY=key/public_key.pem
```
## Private Key
Use Openssl to generate public/private key for JWT
```
openssl genpkey -algorithm RSA -out private_key.pem -pkeyopt rsa_keygen_bits:2048
openssl rsa -pubout -in private_key.pem -out public_key.pem
```
