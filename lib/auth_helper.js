require('dotenv').config();

const fs = require("fs");
const jwt = require('jsonwebtoken');

var privateKey = fs.readFileSync(process.env.PRIVATE_KEY);
var publicKey = fs.readFileSync(process.env.PUBLIC_KEY);

function createApplication() {

    let app = {};

    app.init = function () {}

    app.getTokenEmail = function (token) {
        try {
            let result = jwt.verify(token, publicKey);
            return result.emailAddress;
        } catch (err) {
            console.log(err);
            return null;
        }
    }

    app.verifyToken = function (token) {
        // console.log(`token : ${token}`);
        try {
            jwt.verify(token, publicKey);
            return true;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    app.generateToken = function (emailAddress) {
        let signOptions = {
          //  expiresIn: "24h",
            algorithm: "RS256" // RSASSA [ "RS256", "RS384", "RS512" ]
        };
        
        // sign with RSA SHA256
        let token = jwt.sign({
            emailAddress : emailAddress
        }, privateKey, signOptions, {
            algorithm: 'RS256'
        });
        return token;
    }

    return app;
}

exports = module.exports = createApplication;