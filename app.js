require('dotenv').config();

const authClient = require("./lib/auth_helper.js")();
const twilioClient = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_ACCOUNT_AUTH);

/**
 * Generate JWT Token
 */
function generateToken(opts) {

    console.log("Generate Token");
    if (opts.req.body.emailAddress == null) return createErrorResponse(opts, "999", "Bad request");

    let myToken = authClient.generateToken(opts.req.body.emailAddress);
    opts.res.json({
        code: "000",
        token: myToken
    });
    return;
}

/**
 * Verify JWT Token
 */
function verifyToken(opts) {

    console.log("Verify Token");
    if (opts.req.headers.authorization == null) {
        console.log("Missing authroization parameter");
        return createErrorResponse(opts, "401", "Bad Request");
    }
    // Use the Authorization Header to proceed the verification
    let token = opts.req.headers.authorization;
    if (authClient.verifyToken(token)) {
        return true;
    } else {
        console.log("Invalid Token");
        return createErrorResponse(opts, "401", "Unauthorized");
    }
}

function getNotificationID(email) {
    // TODO, change to a mapping
    return process.env.TWILIO_TO_ADDRESS;
}

/**
 * Get the Email from the Token
 */
function getTokenEmail(opts) {
    let token = opts.req.headers.authorization;
    return authClient.getTokenEmail(token)
}

/**
 * Generate Token Web Request
 */
exports.token = (req, res) => {
    console.log("Generate Token Request");
    var opts = {
        req: req,
        res: res
    }
    generateToken(opts);
}

/**
 * Notify Bot Web Request
 */
exports.notifyBot = (req, res) => {
    console.log("Notify Bot Request");
    var opts = {
        req: req,
        res: res
    }
    if (isValidNotify(opts)) processNotify(opts);
}

function isValidNotify(opts) {
    if (!verifyToken(opts)) return false;
    if (opts.req.body.code == null) return createErrorResponse(opts, "999", "Code is null");
    if (opts.req.body.data == null) return createErrorResponse(opts, "999", "Data is null");
    if (opts.req.body.data.length == 0) return createErrorResponse(opts, "999", "Data is empty");
    return true;
}

function processNotify(opts) {
    console.log(`Process Notification`);

    let code = opts.req.body.code;
    let data = opts.req.body.data;
    var id = getNotificationID(getTokenEmail(opts));
    console.log(`Process Notification : ${id} ${code}`, data);

    let messageList = [];
    if (code == "000") {
        for (let i = 0; i < data.length; i++) {
            let object = data[i];

            let message = "";
            if (object.type == "ICT") {
                let bank = object.bank;
                let payer = object.payer;
                let creditAmount = object.creditAmount;
                let creditAccount = object.creditAccount;
                message = `親 : ${payer} 使用轉數快過 ${creditAmount} 錢給你的 ${bank} 金額，入賬戶口為 ${creditAccount}`;
            }

            if (object.type == "OCT") {
                let bank = object.bank;
                let payee = object.payee;
                let debitAmount = object.debitAmount;
                let debitAccount = object.debitAccount;
                message = `親 : 你剛使用轉數快過 ${debitAmount} 給 ${payee}, 由 ${bank} 戶口 ${debitAccount} 扣除` ;
            }

            if (object.type == "STM") {
                let bank = object.bank;
                let acct = object.acct;
                message = `親 : 你有電子月結單，快來看看 : ${bank} ${acct}`;
            }

            messageList.push(message);
        }
    }

    sendWhatapps(opts, id, messageList.join("\n\n"));
}

function sendWhatapps(opts, id, message) {

    console.log(`Send Whatapps ${id} ${message}`);

    twilioClient.messages
        .create({
            body: message,
            from: process.env.TWILIO_FROM_ADDRESS,
            to: id,
        })
        .then(response => {

            console.log(response.sid);
            opts.res.json({
                code: "000",
                message: "OK",
                id: response.sid
            });
        })
        .done();
}

// Create Error Response and send
function createErrorResponse(opts, code, message, raw) {
    let response = {
        code: code,
        message: message,
        raw: raw
    }

    opts.res.status(417).json(response)
    return false;
}