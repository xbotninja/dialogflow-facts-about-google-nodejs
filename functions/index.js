/**
 * Copyright 2017 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

"use strict";

const functions = require("firebase-functions");
const { WebhookClient } = require("dialogflow-fulfillment");
const { Card } = require("dialogflow-fulfillment");
const { Image } = require("dialogflow-fulfillment");
const { Suggestion } = require("dialogflow-fulfillment");
const BIGQUERY = require("@google-cloud/bigquery");
const sgMail = require('@sendgrid/mail');
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "webapps.ifad.org",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: 'chatbot@infra.ifad.org', // generated ethereal user
        pass: 'Bz4ofDrYP1cIep1k', // generated ethereal password
    }
});

const BIGQUERY_CLIENT = new BIGQUERY({
    projectId: "ifad-kqle" // ** CHANGE THIS **
});

process.env.DEBUG = "dialogflow:debug";

exports.dialogflowFirebaseFulfillment = functions.https.onRequest(
    (request, response) => {
        const agent = new WebhookClient({ request, response });
        console.log(
            "Dialogflow Request headers: " + JSON.stringify(request.headers)
        );
        console.log("Dialogflow Request body: " + JSON.stringify(request.body));

        function welcome(agent) {
            agent.add(`Welcome to my agent!`);
        }

        function fallback(agent) {
            agent.add(`I didn't understand`);
            agent.add(`I'm sorry, can you try again?`);
        }
        /**
         * Account Self Service - reset : Intent Fulfilment
         */
        function 	accountSelfService(agent) {
            const ISSUE_TEXT = request.body.queryResult.queryText;
            console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
            console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
            var buttonTextPM="Go to password reset page";
            var titleText="IFAD Self Service";
            //Rich Response
            agent.add("  ");
            agent.add("See common Account Suggestions below");
            agent.add(
                new Suggestion({
                    title: 'Reset Password'
                })
            );
            agent.add(
                new Suggestion({
                    title: 'Change Password'
                })
            );
            agent.add(
                new Suggestion({
                    title: 'Unlock Account'
                })
            );
        }
        /**
         * 2FA/MFA Token Self Service - reset : Intent Fulfilment
         */
        function 	MFASelfServiceToken(agent) {
            const ISSUE_TEXT = request.body.queryResult.queryText;
            console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
            console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
            //Rich Response
            agent.add("  ");
            agent.add("See common Token Related 2FA/MFA Suggestions below");
            agent.add(
                new Suggestion({
                    title: 'Lost Soft Token'
                })
            );
            agent.add(
                new Suggestion({
                    title: 'Lost Hard Token'
                })
            );
            agent.add(
                new Suggestion({
                    title: 'Change Hard Token Pin'
                })
            );
            agent.add(
                new Suggestion({
                    title: 'Forgotten Hard Token Pin'
                })
            );

        }
        /**
         * 2FA/MFA Self Service - reset : Intent Fulfilment
         */
        function 	MFASelfServiceOther(agent) {
            const ISSUE_TEXT = request.body.queryResult.queryText;
            console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
            console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
            //Rich Response
            agent.add("  ");
            agent.add("See common none token 2FA/MFA Suggestions below");
            agent.add(
                new Suggestion({
                    title: 'Lost Connection'
                })
            );
            agent.add(
                new Suggestion({
                    title: 'Limited Connection'
                })
            );
            agent.add(
                new Suggestion({
                    title: 'Token Self Service UnAvailable'
                })
            );
            agent.add(
                new Suggestion({
                    title: 'Push Notification'
                })
            );
            agent.add(
                new Suggestion({
                    title: 'PulseSecure'
                })
            );
        }
        /**
         * I have a token intent : Intent Fulfilment
         */
        function canNotAccessTokenSelfServiceYES(agent) {
            const ISSUE_TEXT = request.body.queryResult.queryText;
            console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
            console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
            const email = agent.parameters.email;
            const supportEmail = 'support_chatbot@ifad.org';
            const emailRef = 'Reported issue - No access to the portal';
            /**
             * Send Ticket Notification : Intent Fulfilment
             */
            const mailOptions = {
                from: "noreply@ifad.org", // sender address
                to: supportEmail , // list of receivers
                subject: emailRef, // Subject line
                html: `<p> User ${email} reported issue - No access to the Self Service Portal</p>`
            };
            transporter.sendMail(mailOptions, function (err, info) {
                if(err)
                {
                    console.log(err);
                }
            });
            agent.add("Reported issue to IT support - No access to the portal");
        }
        /**
         * No Token order one : Intent Fulfilment
         */
        function canNotAccessTokenSelfServiceNO(agent) {
            const ISSUE_TEXT = request.body.queryResult.queryText;
            console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
            console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
            const email = agent.parameters.email;
            const supportEmail = 'support_chatbot@ifad.org';
            const emailRef = 'Automatic Smart Token requested';
            /**
             * Send Ticket Notification : Intent Fulfilment
             */
            const mailOptions = {
                from: "noreply@ifad.org", // sender address
                to: supportEmail , // list of receivers
                subject: emailRef, // Subject line
                html: `<p> A Smart token has automatically been ordered for you :</p><p> Smart Token Requested for user ${email} </p>`
            };
            // verify connection configuration
            transporter.verify(function(error, success) {
                if (error) {
                    console.log(error);
                } else {
                    console.log("Server is ready to take our messages");
                }
            });

            transporter.sendMail(mailOptions, function (err, info) {
                if(err)
                {
                    console.log(err);
                }
            });
            agent.add("A Smart Token has been automatically ordered for you");
        }
        /**
         * can not access token self service : Intent Fulfilment
         */
        function canNotAccessTokenSelfService(agent) {
            const ISSUE_TEXT = request.body.queryResult.queryText;
            console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
            console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
            var image1 = "https://storage.googleapis.com/chatbot_storage_bucket/PULSESECURE1.png";
            var image2 = "https://storage.googleapis.com/chatbot_storage_bucket/pulsesecure2.png";
            var image3 = "https://storage.googleapis.com/chatbot_storage_bucket/pulsesecure3.png";
            var  titleText4 = "Limited connection:";
            var  titleText5 = "1. Click on the Pulse Secure icon in the System Tray";
            var  titleText6 = "2. Select IFAD corporate network and click on Connect";
            var  titleText7 = "3. Authenticate in the normal manner.";
            agent.add(titleText4);
            agent.add(titleText5);
            agent.add(
                new Image({
                    imageUrl: image1,
                })
            );
            agent.add(titleText6);
            agent.add(
                new Image({
                    imageUrl: image2,
                })
            );
            agent.add(titleText7);
            agent.add(
                new Image({
                    imageUrl: image3,
                })
            );
        }
        /**
         * change Hard Token Pin : Intent Fulfilment
         */
        function changeHardTokenPin(agent) {
            const ISSUE_TEXT = request.body.queryResult.queryText;
            console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
            console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
            var image1 = "https://storage.googleapis.com/chatbot_storage_bucket/hardtoken.png";
            var image2 = "https://storage.googleapis.com/chatbot_storage_bucket/hardtoken2.png";
            var  titleText1 = "With your hard token ready:";
            var  titleText2 = "1. Go to https://selfservice.ifad.org/Tokens";
            var  titleText3 = "2. Log in using your network username and password";
            var  titleText4 = "3. Click on the Set New PIN button";
            var  titleText5 = "4. Generate your One Time Password (OTP) on the hard token";
            var  titleText6 = "5. In the OTP field enter your old PIN (4 digits) plus the OTP you have just generated";
            var  titleText7 = "6. In the New PIN field enter your new PIN (4 digits)";
            var  titleText8 = "7. Click Set PIN button";
            agent.add(titleText1);
            agent.add(titleText2);
            agent.add(titleText3);
            agent.add(titleText4);
            agent.add(
                new Image({
                    imageUrl: image1,
                })
            );
            agent.add(titleText5);
            agent.add(titleText6);
            agent.add(titleText7);
            agent.add(titleText8);
            agent.add(
                new Image({
                    imageUrl: image2,
                })
            );
        }
        /**
         * Change hard Token Pin EMAIL : Intent Fulfilment
         */
        function changeHardTokenPinEmail(agent) {
            const ISSUE_TEXT = request.body.queryResult.queryText;
            console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
            console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
            const email = agent.parameters.email;
            const supportEmail = 'support_chatbot@ifad.org';
            const emailRef = 'Hard Token Pin change requested';
            /**
             * Send Ticket Notification : Intent Fulfilment
             */
            const mailOptions = {
                from: "noreply@ifad.org", // sender address
                to: supportEmail , // list of receivers
                subject: emailRef, // Subject line
                html: `<p> A hard token pin change request has been sent :</p><p> Hard Token Pin Requested for user ${email} </p>`
            };
            // verify connection configuration
            transporter.verify(function(error, success) {
                if (error) {
                    console.log(error);
                } else {
                    console.log("Server is ready to take our messages");
                }
            });

            transporter.sendMail(mailOptions, function (err, info) {
                if(err)
                {
                    console.log(err);
                }
            });
            agent.add("hard Token Pin change request sent");
            agent.add("You will receive an email from support team with further instructions");
        }
        /**
         * change Hard Token Pin : Intent Fulfilment
         */
        function forgottenHardTokenPin(agent) {
            const ISSUE_TEXT = request.body.queryResult.queryText;
            const email = agent.parameters.email;
            const supportEmail = 'support_chatbot@ifad.org';
            const emailRef = 'Reset Hard Token Password Request';
            console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
            console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
            /**
             * Send Ticket Notification : Intent Fulfilment
             */
            const mailOptions = {
                from: "noreply@ifad.org", // sender address
                to: supportEmail , // list of receivers
                subject: emailRef, // Subject line
                html: `<p> A PIN Change request has been sent </p><p> For user with email ${email} </p>`
            };
            // verify connection configuration
            transporter.verify(function(error, success) {
                if (error) {
                    console.log(error);
                } else {
                    console.log("Server is ready to take our messages");
                }
            });

            transporter.sendMail(mailOptions, function (err, info) {
                if(err)
                {
                    console.log(err);
                }
            });
            agent.add("A hard token PIN reset request has been sent.");
            agent.add("You will receive an email from the support team with further instructions");
        }
        /**
         * lost my connection : Intent Fulfilment
         */
        function lostMyConnection(agent) {
            const ISSUE_TEXT = request.body.queryResult.queryText;
            console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
            console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
            var image1 = "https://storage.googleapis.com/chatbot_storage_bucket/PULSESECURE1.png";
            var image2 = "https://storage.googleapis.com/chatbot_storage_bucket/pulsesecure2.png";
            var image3 = "https://storage.googleapis.com/chatbot_storage_bucket/pulsesecure3.png";
            var  titleText1 = "1. Click on the Pulse Secure icon in the System Tray.";
            var  titleText2 = "2. Select IFAD corporate network and click on Connect.";
            var  titleText3 = "3. Authenticate in the normal manner.";
            agent.add(titleText1);
            agent.add(
                new Image({
                    imageUrl: image1,
                })
            );
            agent.add(titleText2);
            agent.add(
                new Image({
                    imageUrl: image2,
                })
            );
            agent.add(titleText3);
            agent.add(
                new Image({
                    imageUrl: image3,
                })
            );
            agent.add("  ");
        }
              /**
         * I have lost connection - Not Pulse Secure
         */
        function lostMyConnectionNotPulseSecure(agent) {
            const ISSUE_TEXT = request.body.queryResult.queryText;
            const email = agent.parameters.email;
            const supportEmail = 'support_chatbot@ifad.org';
            const emailRef = 'Open ticket for lost connection issue';
            console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
            console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
            /**
             * Send Ticket Notification : Intent Fulfilment
             */
            const mailOptions = {
                from: "noreply@ifad.org", // sender address
                to: supportEmail , // list of receivers
                subject: emailRef, // Subject line
                html: `<p> User with email ${email} lost connection not Pulse Secure related </p>`
            };
            // verify connection configuration
            transporter.verify(function(error, success) {
                if (error) {
                    console.log(error);
                } else {
                    console.log("Server is ready to take our messages");
                }
            });

            transporter.sendMail(mailOptions, function (err, info) {
                if(err)
                {
                    console.log(err);
                }
            });
            agent.add("A ticket has been opened for you. Issue - Lost connection not Pulse Secure related");
        }
        /**
         * lost my hard token - I have a hard token : Intent Fulfilment
         */
        function lostMyHardTokenYes(agent) {
            const ISSUE_TEXT = request.body.queryResult.queryText;
            const email = agent.parameters.email;
            const supportEmail = 'support_chatbot@ifad.org';
            const emailRef = 'New Hard Token Request';
            console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
            console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
            /**
             * Send Ticket Notification : Intent Fulfilment
             */
            const mailOptions = {
                from: "noreply@ifad.org", // sender address
                to: supportEmail , // list of receivers
                subject: emailRef, // Subject line
                html: `<p> A New Hard Token request has been sent.</p><p> For user With email ${email} </p>`
            };
            // verify connection configuration
            transporter.verify(function(error, success) {
                if (error) {
                    console.log(error);
                } else {
                    console.log("Server is ready to take our messages");
                }
            });

            transporter.sendMail(mailOptions, function (err, info) {
                if(err)
                {
                    console.log(err);
                }
            });
            agent.add("New Hard Token request has been sent?");
            agent.add("Please check your email for next steps?");
        }
        /**
         * lost my soft token - I have a hard token : Intent Fulfilment
         */
        function lostMySoftTokenYes(agent) {
            const ISSUE_TEXT = request.body.queryResult.queryText;
            console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
            console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
            var image1 = "https://storage.googleapis.com/chatbot_storage_bucket/lostphone.png";
            var  titleText1 = "1. Go to https://selfservice.ifad.org/Tokens";
            var  titleText2 = "2. Log in using your network username and password";
            var  titleText3 = "3. Click on Unassign button next to the smart token";
            var  titleText4 = "4. Register a new smart token following the instructions on the Register smart token quick card.";

            agent.add(titleText1);
            agent.add(titleText2);
            agent.add(titleText3);
            agent.add(
                new Image({
                    imageUrl: image1,
                })
            );
            agent.add(titleText4);
        }
        /**
         * lost my soft token : Intent Fulfilment
         */
        function lostMySoftTokenNo(agent) {
            const ISSUE_TEXT = request.body.queryResult.queryText;
            console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
            console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
            var image1 = "https://storage.googleapis.com/chatbot_storage_bucket/lostphone.png";
            var  titleText1 = "1. You will soon receive an email from 2fasupport@ifad.org with instructions, link to access and a temporary access code valid 24 hours.";
            var  titleText2 = "2. Follow the instructions in the email up to and including step 4, then";
            var  titleText3 = "3. Unassign your smart token by going to selfservice.ifad.org / manage my tokens and click on the unassign button";
            var  titleText4 = "4. You can now follow steps 5 and 6 in the instructions in the email received from 2fasupport@ifad.org";
            const email = agent.parameters.email;
            const supportEmail = 'support_chatbot@ifad.org';
            const issueHardToken = 'New Hard Token Automatically requested';
            const issue = 'smart token request';
            const description = 'smart token request for user';
            const descriptionHardToken = 'Hard token request for user';
            const division = ' PROJ=91';
            const status = 'OPEN';
            /**
             *  Order Smart token Send Email to Footprints open new ticket : Intent Fulfilment
             */
            const mailOptionsFootprints = {
                from: "noreply@ifad.org", // sender address
                to: "itsupport@ifad.org", // list of receivers
                subject: issue+division, // Subject line
                html: `<p>  ${description}  </p><p> sender= ${email}  </p><p>  Status=${status}  </p>`
            };
            transporter.sendMail(mailOptionsFootprints, function (err, info) {
                if(err)
                {
                    console.log(err);
                }
            });
            agent.add(titleText1);
            agent.add(titleText2);
            agent.add(titleText3);
            agent.add(
                new Image({
                    imageUrl: image1,
                })
            );
            agent.add(titleText4);
        }
        /**
         * most Common 2FA Mistakes : Intent Fulfilment
         */
        function mostCommon2FAMistakes(agent) {
            const ISSUE_TEXT = request.body.queryResult.queryText;
            console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
            console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
            var  managerURL="https://xbot.ninja/~xbotninj/wp-content/uploads/2020/08/Screenshot-2020-08-26-at-08.07.03.png";
            var buttonTextPM = "See Full Image";
            var  titleText = "Common 2FA Mistakes ";

            agent.add(
                new Card({
                    title:
                        titleText +" "+managerURL,
                    imageUrl:
                        "https://xbot.ninja/~xbotninj/wp-content/uploads/2020/08/Screenshot-2020-08-26-at-08.07.03.png",
                    text: "Common 2fa issues: "+ISSUE_TEXT,
                    buttonText: buttonTextPM,
                    buttonUrl: managerURL
                })
            );
            agent.add("  ");
            agent.add("Is there anything else I can help you with?");
        }
        /**
         * lost my soft token - I have a hard token : Intent Fulfilment
         */
        function get2FAAccess(agent) {
            const ISSUE_TEXT = request.body.queryResult.queryText;
            console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
            console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
            const email = agent.parameters.email;
            const supportEmail = 'support_chatbot@ifad.org';
            const emailRef = 'New 2FA Access Request';
            /**
             * Send Ticket Notification : Intent Fulfilment
             */
            const mailOptions = {
                from: "noreply@ifad.org", // sender address
                to: supportEmail , // list of receivers
                subject: emailRef, // Subject line
                html: `<p> New 2FA Access request :</p><p> For user With Email ${email} </p>`
            };
            // verify connection configuration
            transporter.verify(function(error, success) {
                if (error) {
                    console.log(error);
                } else {
                    console.log("Server is ready to take our messages");
                }
            });

            transporter.sendMail(mailOptions, function (err, info) {
                if(err)
                {
                    console.log(err);
                }
            });
            agent.add("I've sent a 2FA Access request for you");

        }
        /**
         * Self Service - reset : Intent Fulfilment
         */
        function selfService(agent) {
            const ISSUE_TEXT = request.body.queryResult.queryText;
            console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
            console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
            var buttonTextPM="Go to password reset page";
            agent.add("  ");
            agent.add("See other account suggestions below");
            agent.add(
                new Suggestion({
                    title: 'Reset Password'
                })
            );
            agent.add(
                new Suggestion({
                    title: 'Change Password'
                })
            );
            agent.add(
                new Suggestion({
                    title: 'Unlock Account'
                })
            );
        }
        /**
         * Password Reset - reset : Intent Fulfilment
         */
        function passwordReset(agent) {
            const ISSUE_TEXT = request.body.queryResult.queryText;
            console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
            console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
            var managerURL ="https://selfservice.ifad.org/SelfService/Home/reset";
            var response1="Go to password reset page";
            var response2="Enter your user Id and click Reset";
            //Rich Response
            agent.add(response1);
            agent.add(managerURL);
            agent.add(response2);
            agent.add("  ");
            agent.add("See other links if needed");
            agent.add(
                new Suggestion({
                    title: 'Change Password'
                })
            );
            agent.add(
                new Suggestion({
                    title: 'Unlock Account'
                })
            );
        }
        /**
         * Password Change - change : Intent Fulfilment
         */
        function passwordChange(agent) {
            const ISSUE_TEXT = request.body.queryResult.queryText;
            console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
            console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
            var managerURL ="https://selfservice.ifad.org/SelfService/Home/change";
            var response1="Go to password change page";
            var response2="Enter new details and click Change";
            //Rich Response
            agent.add(response1);
            agent.add(managerURL);
            agent.add(response2);
            agent.add("  ");
            agent.add("See other links if needed");
            agent.add(
                new Suggestion({
                    title: 'Reset Password'
                })
            );
            agent.add(
                new Suggestion({
                    title: 'Unlock Account'
                })
            );

        }
        /**
         * Password Lockout - lockout : Intent Fulfilment
         */
        function passwordLockout(agent) {
            const ISSUE_TEXT = request.body.queryResult.queryText;
            console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
            console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
            var selfServiceURL ="https://selfservice.ifad.org/SelfService/Home/lockout";
            var response1="Go to password lockout page";
            var response2="Enter credentials and click Check";
            //Rich Response
            agent.add(response1);
            agent.add(selfServiceURL);
            agent.add(response2);
            agent.add("  ");
            agent.add("See other links if needed");
            agent.add(
                new Suggestion({
                    title: 'Reset Password'
                })
            );
            agent.add(
                new Suggestion({
                    title: 'Change Password'
                })
            );
        }
        /**
         * Get Ticket Count : Intent Fulfilment
         */
        function getTicketCount(agent) {
            const COUNT_QUERY = agent.parameters.mrstatus.toUpperCase();
            console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
            console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
            const SQLQUERY =   `SELECT COUNT(*) as mrstatus FROM \`ifad-kqle.helpdesk.ticket2\` WHERE mrstatus= @mrstatus`;
            const OPTIONS = {
                query: SQLQUERY,
                // Location must match that of the dataset(s) referenced in the query.
                location: "US",
                params: {
                    mrstatus: COUNT_QUERY
                }
            };
            return BIGQUERY_CLIENT.query(OPTIONS)
                .then(results => {
                    //Capture results from the Query
                    console.log(JSON.stringify(results[0]));
                    const QUERY_RESULT = results[0];
                    const ROW_COUNT = QUERY_RESULT[0].mrstatus;

                    agent.add(
                        new Card({
                            title:
                                "There are   " +ROW_COUNT+". "+ COUNT_QUERY +" Tickets" ,
                            imageUrl:
                                "https://xbot.ninja/~xbotninj/wp-content/uploads/2020/08/ifad1.jpg",
                            text: "Ticket Count: "+ROW_COUNT,
                            buttonText: "Go to Ticket Record",
                            buttonUrl: "https://assistant.google.com/"
                        })
                    );
                })
                .catch(err => {
                    console.error("ERROR:", err);
                });
        }
        /**
         * Update Ticket : Intent Fulfilment
         */
        function updateTicket(agent) {
            const ISSUE_ID = agent.parameters.mrid;
            agent.add(
                new Card({
                    title:
                        "Update ticket with reference  " +ISSUE_ID ,
                    imageUrl:
                        "https://xbot.ninja/~xbotninj/wp-content/uploads/2020/08/ifad1.jpg",
                    text: "Issue description: ",
                    buttonText: "Go to Ticket Record",
                    buttonUrl: "https://assistant.google.com/"
                })
            );
        }
        /**
         * Get Ticket Status : Intent Fulfilment
         */
        function getTicketStatus(agent) {
            const ISSUE_ID = agent.parameters.mrid;
            console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
            console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
            const OUTPUT_CONTEXTS = request.body.queryResult.outputContexts;
            const EMAIL = OUTPUT_CONTEXTS[OUTPUT_CONTEXTS.length - 1].parameters["email.original"];
            const ISSUE_CATEGORY = OUTPUT_CONTEXTS[OUTPUT_CONTEXTS.length - 1].parameters.category;
            const ticketID = makeid(6);
            const SQLQUERY = `SELECT * FROM \`ifad-kqle.helpdesk.ticket2\` WHERE mrid = @mrid`;
            const OPTIONS = {
                query: SQLQUERY,
                // Location must match that of the dataset(s) referenced in the query.
                location: "US",
                params: {
                    mrid: ISSUE_ID
                }
            };
            return BIGQUERY_CLIENT.query(OPTIONS)
                .then(results => {
                    //Capture results from the Query
                    console.log(JSON.stringify(results[0]));
                    const QUERY_RESULT = results[0];
                    const FIRST_NAME = QUERY_RESULT[0].first_bname;
                    const LAST_NAME = QUERY_RESULT[0].last_bname;
                    const TICKET_ID = QUERY_RESULT[0].mrid;
                    const SUBMITTED = QUERY_RESULT[0].mrsubmitdate;
                    const PHONE = QUERY_RESULT[0].phone;
                    const MRTITLE = QUERY_RESULT[0].mrtitle;
                    const MRSTATUS= QUERY_RESULT[0].mrstatus;
                    const MRDESCRIPTION = QUERY_RESULT[0].mrdescription;
                    const MRASSIGNEES = QUERY_RESULT[0].mrassignees;
                    const MRSUBMITTER = QUERY_RESULT[0].mrsubmitter;
                    //Format the Output Message
                    agent.add("Status for ticket with reference  " +TICKET_ID+". Statust  " +MRSTATUS


                    );
                    agent.add(
                        new Card({
                            title:
                                "Status for ticket with reference :  " +TICKET_ID+". Status :  " +MRSTATUS ,
                            imageUrl:
                                "https://xbot.ninja/~xbotninj/wp-content/uploads/2020/08/ifad1.jpg",
                            text: "Issue description: "+MRTITLE,
                            buttonText: "Go to Ticket Record",
                            buttonUrl: "https://assistant.google.com/"
                        })
                    );
                })
                .catch(err => {
                    console.error("ERROR:", err);
                });
        }
        /**
         * Create Ticket : Intent Fulfilment
         */
        function getTicket(agent) {
            const ISSUE_ID = agent.parameters.mrid;
            console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
            console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
            const OUTPUT_CONTEXTS = request.body.queryResult.outputContexts;
            const EMAIL = OUTPUT_CONTEXTS[OUTPUT_CONTEXTS.length - 1].parameters["email.original"];
            const ISSUE_CATEGORY = OUTPUT_CONTEXTS[OUTPUT_CONTEXTS.length - 1].parameters.category;
            const ticketID = makeid(6);
            const SQLQUERY =   `SELECT * FROM \`ifad-kqle.helpdesk.tickets\` WHERE mrid = @mrid`;
            const OPTIONS = {
                query: SQLQUERY,
                // Location must match that of the dataset(s) referenced in the query.
                location: "US",
                params: {
                    mrid: ISSUE_ID
                }
            };
            return BIGQUERY_CLIENT.query(OPTIONS)
                .then(results => {
                    //Capture results from the Query
                    console.log(JSON.stringify(results[0]));
                    const QUERY_RESULT = results[0];
                    const FIRST_NAME = QUERY_RESULT[0].first_bname;
                    const LAST_NAME = QUERY_RESULT[0].last_bname;
                    const TICKET_ID = QUERY_RESULT[0].mrid;
                    const SUBMITTED = QUERY_RESULT[0].mrsubmitdate;
                    const MRTITLE = QUERY_RESULT[0].mrtitle;
                    const MRSTATUS= QUERY_RESULT[0].mrstatus;
                    const MRDESCRIPTION = QUERY_RESULT[0].mrdescription;
                    const MRASSIGNEES = QUERY_RESULT[0].mrassignees;
                    const MRSUBMITTER = QUERY_RESULT[0].mrsubmitter;
                    //Format the Output Message
                    agent.add("Here is the ticket with reference  " +TICKET_ID+". Submited  " + SUBMITTED+
                        " For  " + FIRST_NAME  + " " +LAST_NAME +"," +
                        " Issue : " + MRTITLE +"," +
                        " Description : " +  MRDESCRIPTION +"," +
                        " Assignee : " + MRASSIGNEES +"," +
                        " Submitter : " + MRSUBMITTER

                    );
                    agent.add(
                        new Card({
                            title:
                                "Here is the ticket with reference : " +TICKET_ID+". Submited : " + SUBMITTED+
                                " For  " + FIRST_NAME  + " " +LAST_NAME +"," +
                                " Issue : " + MRTITLE +"," +
                                " Description : " +  MRDESCRIPTION +"," +
                                " Assignee : " + MRASSIGNEES +"," +
                                " Submitter : " + MRSUBMITTER,
                            imageUrl:
                                "https://xbot.ninja/~xbotninj/wp-content/uploads/2020/08/ifad1.jpg",
                            text: "Issue description: "+MRTITLE,
                            buttonText: "Go to Ticket Record",
                            buttonUrl: "https://assistant.google.com/"
                        })
                    );
                    agent.add("Is there anything else I help you with  "+FIRST_NAME);
                })
                .catch(err => {
                    console.error("ERROR:", err);
                });
        }

        //Create Ticket
        function createTicket(agent) {
            const name_bq = agent.parameters.name;
            const mrid = generateId (20);
            const last__bname = agent.parameters.lastName;
            const first__bname = agent.parameters.firstName;
            const email__baddress = agent.parameters.email;
            const phone = agent.parameters.phone;
            const room__bnumber = agent.parameters.phone;
            const division = agent.parameters.division;
            const country__boffice = agent.parameters.countryOffice;
            const city = agent.parameters.city;
            const mrtitle = agent.parameters.mrtitle;
            const mrpriority = agent.parameters.issuePriority;
            const mrstatus = agent.parameters.issueStatus;
            const mrdescription = agent.parameters.issueDescription;
            const mralldescription = agent.parameters.issueAllDescription;
            const mrassignees = "Not Assigned";
            const mrsubmitter = agent.parameters.email;
            const mrsubmitdate = new Date();

            /**
             * BQ Customer DB Details:
             */
            const projectId = 'ifad-pvbpyx';
            const datasetId = "helpdesk";
            const tableId = "ticket";
            const bigquery = new BIGQUERY({
                projectId: projectId
            });
            const rows = [{mrid: mrid,last__bname:last__bname,first__bname:first__bname,email__baddress:email__baddress,phone:phone,room__bnumber:room__bnumber,division:division,country__boffice:country__boffice,city:city,mrtitle:mrtitle,mrpriority:mrpriority,mrstatus:mrstatus,mrdescription:mrdescription,mralldescription:mralldescription,mrassignees:mrassignees,mrsubmitter:mrsubmitter,mrsubmitdate:mrsubmitdate}];

            bigquery
                .dataset(datasetId)
                .table(tableId)
                .insert(rows)
                .then(() => {
                    console.log(`Inserted ${rows.length} rows`);
                })
                .catch(err => {
                    if (err && err.name === 'PartialFailureError') {
                        if (err.errors && err.errors.length > 0) {
                            console.log('Insert errors:');
                            err.errors.forEach(err => console.error(err));
                        }
                    } else {
                        console.error('ERROR:', err);
                    }
                });
            agent.add(`Thanks ${first__bname} all done. Your ticket with reference  ${mrid} has been submitted.`);
        }
        /**
         * Create and Submit Ticket : Intent Fulfilment
         */
        function createTicket2(agent) {
            const mrid = makeid(6);
            const email_baddress = agent.parameters.email;
            const mrtitle = agent.parameters.mrtitle;
            const mrstatus= "OPEN";
            const mrdescription = agent.parameters.issueDescription;
            const mrassignees = "Not Assigned";
            const mrsubmitter = agent.parameters.email;
            const mrsubmitdate = new Date();
            const mrcategory="IT Support";
            const emailRef = "IT Support ticket with reference "+mrid+ " created";
            const emailMessage = "******This is an Automated Notification******";
            const division = " PROJ=91";
            /**
             * BQ Customer DB Details:
             */
            var userEmail=email_baddress;
            var splitUserAndDomain = userEmail.split('@');
            var userName = splitUserAndDomain[0];
            var splitFirstAndLastName = userName.split('.');
            var firstName = splitUserAndDomain[0];
            var lastName = splitUserAndDomain[1];
            /**
             * BQ Customer DB Details:
             */
            const projectId = 'ifad-kqle';
            const datasetId = "helpdesk";
            const tableId = "tickets";
            const bigquery = new BIGQUERY({
                projectId: projectId
            });
            const rows = [{mrid: mrid,last_bname:lastName,first_bname:firstName,email_baddress:email_baddress,mrtitle:mrtitle, mrstatus:mrstatus, mrdescription:mrdescription, mrassignees:mrassignees, mrsubmitter:mrsubmitter, mrsubmitdate:mrsubmitdate,mrcategory:mrcategory}];

            bigquery
                .dataset(datasetId)
                .table(tableId)
                .insert(rows)
                .then(() => {
                    console.log(`Inserted ${rows.length} rows`);
                })
                .catch(err => {
                    if (err && err.name === 'PartialFailureError') {
                        if (err.errors && err.errors.length > 0) {
                            console.log('Insert errors:');
                            err.errors.forEach(err => console.error(err));
                        }
                    } else {
                        console.error('ERROR:', err);
                    }
                });
            /**
             * Send Email to Footprints open new ticke : Intent Fulfilment
             */
            const mailOptionsFootprints = {
                from: "noreply@ifad.org", // sender address
                to: "itsupport@ifad.org", // list of receivers
                subject: mrtitle+division, // Subject line
                html: `<p>  ${mrdescription}  </p><p> sender= ${email_baddress}  </p><p>  Status=${mrstatus}  </p>`
            };
            transporter.sendMail(mailOptionsFootprints, function (err, info) {
                if(err)
                {
                    console.log(err);
                }
            });
            agent.add(
                new Card({
                    title:
                        "Thanks "+firstName+" all done. A ticket has been open in Footprints"+
                        " Your Reference " + mrid +
                        " (A confirmation email has been sent to: " + email_baddress ,
                    text: "Issue description: " + mrtitle
                })
            );
        }

        /**
         * IT Support : Intent Fulfilment
         */
        function ITSupport(agent) {
            const ISSUE_TEXT = request.body.queryResult.queryText;
            console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
            console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
            var titleText="IFAD Chatbot";
            //Rich Response
            agent.add("  ");
            agent.add("I can help with Account and 2FA/MFA issues. Which would you like?");
            agent.add(
                new Suggestion({
                    title: 'Accounts'
                })
            );
            agent.add(
                new Suggestion({
                    title: '2FA'
                })
            );
        }
        /**
         * IT SUPPORT ETA ML : Intent Fulfilment
         */
        function ticketCollection(agent) {
            // Capture Parameters from the Current Dialogflow Context
            console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
            console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
            const OUTPUT_CONTEXTS = request.body.queryResult.outputContexts;
            const EMAIL = OUTPUT_CONTEXTS[OUTPUT_CONTEXTS.length - 1].parameters["email.original"];
            const ISSUE_CATEGORY = OUTPUT_CONTEXTS[OUTPUT_CONTEXTS.length - 1].parameters.category;
            const ISSUE_TEXT = request.body.queryResult.queryText;
            const ticketID = makeid(6);
            // The SQL Query to Run
            const SQLQUERY = `WITH pred_table AS (SELECT 5 as seniority, "3-Advanced" as experience,
          @category as category, "Request" as type)
          SELECT cast(predicted_label as INT64) as predicted_label
          FROM ML.PREDICT(MODEL helpdesk.predict_eta,  TABLE pred_table)`;

            const OPTIONS = {
                query: SQLQUERY,
                // Location must match that of the dataset(s) referenced in the query.
                location: "US",
                params: {
                    category: ISSUE_CATEGORY
                }
            };
            return BIGQUERY_CLIENT.query(OPTIONS)
                .then(results => {
                    //Capture results from the Query
                    console.log(JSON.stringify(results[0]));
                    const QUERY_RESULT = results[0];
                    const ETA_PREDICTION = QUERY_RESULT[0].predicted_label;
                    //Format the Output Message
                    agent.add("Your ticket has been created. Your reference is " +ticketID+". Someone will contact you shortly. " +
                        " The estimated response time is " + ETA_PREDICTION  + " days."
                    );
                    agent.add(
                        new Card({
                            title:
                                "New " + ISSUE_CATEGORY + " Issue."+
                                " Your Reference " + ticketID +
                                " (Estimated Response Time: " + ETA_PREDICTION  +
                                " days)",
                            imageUrl:
                                "https://xbot.ninja/~xbotninj/wp-content/uploads/2020/08/ifad1.jpg",
                            text: "Issue description: " + ISSUE_TEXT,
                            buttonText: "Go to Ticket Record",
                            buttonUrl: "https://assistant.google.com/"
                        })
                    );
                    agent.setContext({
                        name: "submitticket-collectname-followup",
                        lifespan: 2
                    });
                })
                .catch(err => {
                    console.error("ERROR:", err);
                });
        }
        /**
         * send comment : Intent Fulfilment
         */
        function createComment(agent) {
            const comment = agent.parameters.comment;
            const name = agent.parameters.name;
            const timestamp = new Date();

            /**
             * BQ Customer DB Details:
             */
            const projectId = 'ifad-kqle';
            const datasetId = "data";
            const tableId = "bot_comment";
            const bigquery = new BIGQUERY({
                projectId: projectId
            });
            const rows = [{Timestamp: timestamp, Name:name, Comment:comment}];


            bigquery
                .dataset(datasetId)
                .table(tableId)
                .insert(rows)
                .then(() => {
                    console.log(`Inserted ${rows.length} rows`);
                })
                .catch(err => {
                    if (err && err.name === 'PartialFailureError') {
                        if (err.errors && err.errors.length > 0) {
                            console.log('Insert errors:');
                            err.errors.forEach(err => console.error(err));
                        }
                    } else {
                        console.error('ERROR:', err);
                    }
                });
            agent.add(
                new Card({
                    title:
                        "Your comment with ref: "+name+" submitted. " ,
                    text: "My comment: " + comment
                })
            );
            agent.add(`Thanks ${name}, your comment has been logged `);
        }
        /**
         * Send Email : Intent Fulfilment
         */
        function sendEmailHandler(agent){
            const email = agent.parameters.email;
            const name = agent.parameters.name;

            const mailOptions = {
                from: "noreply@ifad.org", // sender address
                to: email, // list of receivers
                subject: "Email from IFAD chatbot", // Subject line
                html: `<p> Hello ${name} </p>`
            };
            // verify connection configuration
            transporter.verify(function(error, success) {
                if (error) {
                    console.log(error);
                } else {
                    console.log("Server is ready to take our messages");
                }
            });

            transporter.sendMail(mailOptions, function (err, info) {
                if(err)
                {
                    console.log(err);
                }
            });

        }
              /**
         * Create LAN ID and Email
         */
        function createLANIDEmail(agent) {
            const ISSUE_TEXT = request.body.queryResult.queryText;
            const email = agent.parameters.email;
            const firstName = agent.parameters.firstName;
            const lastName = agent.parameters.lastName;
            const supportEmail = 'support_chatbot@ifad.org';
            const emailRef = 'Opened ticket for new LAN ID & Email account';
            console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
            console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
            /**
             * Send Ticket Notification : Intent Fulfilment
             */
            const mailOptions = {
                from: "noreply@ifad.org", // sender address
                to: supportEmail , // list of receivers
                subject: emailRef, // Subject line
                html: `<p> User ${firstName} ${lastName} Request new LAN ID and email account </p>`
            };
            // verify connection configuration
            transporter.verify(function(error, success) {
                if (error) {
                    console.log(error);
                } else {
                    console.log("Server is ready to take our messages");
                }
            });

            transporter.sendMail(mailOptions, function (err, info) {
                if(err)
                {
                    console.log(err);
                }
            });
            agent.add("A ticket has been opened for "+firstName+" "+lastName+" Requesting new LAN ID & Email.");
        }
        /**
         * Account extension
         */
        function accountExtension(agent) {
            const ISSUE_TEXT = request.body.queryResult.queryText;
            const email = agent.parameters.email;
            const firstName = agent.parameters.firstName;
            const lastName = agent.parameters.lastName;
            const extension = agent.parameters.extension;
            const endOfContract = agent.parameters.endOfContract;
            const supportEmail = 'support_chatbot@ifad.org';
            const emailRef = 'Account extension requested';
            console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
            console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
            /**
             * Send Ticket Notification : Intent Fulfilment
             */
            const mailOptions = {
                from: "noreply@ifad.org", // sender address
                to: supportEmail , // list of receivers
                subject: emailRef, // Subject line
                html: `<p> User ${firstName} ${lastName} with email ${email} Requested Account extension for ${extension}. Contract ends ${endOfContract} </p>`
            };
            // verify connection configuration
            transporter.verify(function(error, success) {
                if (error) {
                    console.log(error);
                } else {
                    console.log("Server is ready to take our messages");
                }
            });

            transporter.sendMail(mailOptions, function (err, info) {
                if(err)
                {
                    console.log(err);
                }
            });
            agent.add("An account extension for "+firstName+"  " +lastName+ " with email " + email+" Contract ending "+endOfContract+ " for a period of "+extension+" has been requested");
        }
        // Run the proper function handler based on the matched Dialogflow intent name
        let intentMap = new Map();
        intentMap.set("Default Welcome Intent", welcome);
        intentMap.set("Default Fallback Intent", fallback);
        intentMap.set("IT Support ETA ML - Issue Category", ticketCollection);
        intentMap.set("Demo", ticketCollection);
        intentMap.set("Find Ticket", getTicket);
        intentMap.set("Create Ticket", createTicket);
        intentMap.set("IT Support - yes", createTicket2);
        intentMap.set("Report Issue", createTicket2);
        intentMap.set("Self Service", selfService);
        intentMap.set("IT Support", ITSupport);
        intentMap.set("Update Ticket", updateTicket);
        intentMap.set("Ticket Status", getTicketStatus);
        intentMap.set("Ticket Count", getTicketCount);
        intentMap.set("Submit Comment", createComment);
        intentMap.set("Send Email", sendEmailHandler);
        intentMap.set("Password Reset", passwordReset);
        intentMap.set("Password Change", passwordChange);
        intentMap.set("Unlock Account", passwordLockout);
        intentMap.set("Most Common 2FA Mistakes", mostCommon2FAMistakes);
        intentMap.set("I have lost my connection - yes", lostMyConnection);
        intentMap.set("I have lost my connection - no - yes", lostMyConnectionNotPulseSecure);
        intentMap.set("How can I change my Hard Token PIN - yes", changeHardTokenPin);
        intentMap.set("How can I change my Hard Token PIN - no - yes", changeHardTokenPinEmail);
        intentMap.set("I can’t access https://selfservice.ifad.org/token - yes", canNotAccessTokenSelfService);
        intentMap.set("I can’t access https://selfservice.ifad.org/token - no - yes", canNotAccessTokenSelfServiceYES);
        intentMap.set("I can’t access https://selfservice.ifad.org/token - no - no - yes", canNotAccessTokenSelfServiceNO);
        intentMap.set("I have forgotten my Hard Token PIN – what should I do - no - yes", forgottenHardTokenPin);
        intentMap.set("I have forgotten my Hard Token PIN – what should I do - yes", changeHardTokenPin);
        intentMap.set("Accounts", accountSelfService);
        intentMap.set("2FA - yes", MFASelfServiceToken);
        intentMap.set("2FA - no", MFASelfServiceOther);
        intentMap.set("I changed / lost my personal smartphone with the soft token on it - what should I do? - yes", lostMySoftTokenYes);
        intentMap.set("I changed / lost my personal smartphone with the soft token on it - what should I do? - no", lostMySoftTokenNo);
        intentMap.set("I have lost my hard token - what should I do - yes", lostMyHardTokenYes);
        intentMap.set("Request New Smart Token - yes", lostMySoftTokenYes);
        intentMap.set("Request New Smart Token - no", lostMySoftTokenNo);
        intentMap.set("Request 2FA access - yes", get2FAAccess);
        intentMap.set("Create Email - yes", createLANIDEmail);
        intentMap.set("Extend Account - yes", accountExtension);
        agent.handleRequest(intentMap);
    }
);

function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

