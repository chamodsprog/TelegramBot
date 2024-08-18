
const TelegramBot = require ('node-telegram-bot-api');  
const admin = require("firebase-admin"); 
var request = require('request');  //npm package to make HTTPS calls

const { token } = require("./teletoken.js"); //import telegram token
const bot = new TelegramBot(token, {polling:true});  //initiliazes the telegram token

var serviceAccount = require("./serviceAccountKey.json");  //json file containing the authentication details and private key

admin.initializeApp({   //obtains the firestore authenication details and private key
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const UsersDB = db.collection('Customers'); //Firestore database name

const posterimg = 'https://postimg.cc/3dzvPxk9'; //Link for event poster



//start command  
bot.on('message', function(msg) {  
    const chatId = msg.chat.id; 
    const messageText = msg.text;
    if((messageText).toLowerCase()== '/start') {
      bot.sendMessage(chatId, "Welcome to the Ceylon Ledger Event. I will be your event bot.")
      .then(() => {
        return bot.sendMessage(chatId, "Type or touch the /help to get more info on the registration process.")
      })
      .then(() => {
        return bot.sendMessage(chatId, "For more details on the event refer to the below given poster.")
        .then(()  => {
          return bot.sendPhoto(chatId, posterimg); 
        })
      });
    }
  });



//Help command
  bot.on('message', function(msg) {  
    const chatId = msg.chat.id;
    const messageText = msg.text;
    {
      if((messageText).toLowerCase()== '/help') {
        bot.sendMessage(chatId, "Type or touch the ' /register ' command to enter personal details.")
        .then(() => {
          return bot.sendMessage(chatId, "To get more information regarding the event or registration process please feel free to reach out using the following contact methods.")
        })
        .then(() => {
          return bot.sendMessage(chatId, "Email - chamods11@gmail.com \n \nPhone Number - 0729019141")
        });
      }
    }
  });



// Insert User Details 
bot.on('message', function(msg) { 
  const chatId = msg.chat.id; 
  const newMsg = msg.text.split(' ');
  const time = admin.firestore.FieldValue.serverTimestamp();
  const preregistercommand =  `To obtain free tickets insert the personal details according to the below given format to register :\n \ninsert <First Name> <Last Name> <Email> <Number of tickets> \n  e.g. insert Sanjaya Gunatilleke chamods11@gmail.com 3`;
  if (newMsg[0] === '/register') { 
    bot.sendMessage(chatId, preregistercommand);
  } else if (newMsg[0] === 'insert') {  //The data structure that is being entered.
    const dataId = newMsg[1].trim(); //trim removes space from sides of the string.
    const datainfo = { 
      FName:newMsg[1],
      LName:newMsg[2],
      Email:newMsg[3],
      NoTickets:newMsg[4],
      id: chatId,
      timestamp:time, //Time stamp will be displayed in the firebase console
    };
    UsersDB
    .doc(dataId) //adds the data into the firestore datbase
    .set(datainfo)
    .then(() => { 
      console.log('Personal details stored in the firestore database:', datainfo);
        bot.sendMessage(chatId, ` ${datainfo.FName} your personal details has been successfully added.`)
        .then(() => {
          return bot.sendMessage(chatId, `Your ticket reference number is "${datainfo.id}".`)
        })
        .then(() => {
          return bot.sendMessage(chatId, "Press the https://t.me/+brzy6ZWALpk5OTY1 link to be transffered to the 'Ceylon Ledger Event Group' .")
          .then(()  => {
            return bot.sendMessage(chatId, "We look forward for your participation. Thank you !"); 
          })
        });
    })
    .catch((error) => {  //If an error is encontured.
      console.error(' Error storing facts in Firestone:', error);
      bot.sendMessage(chatId, 'Details have not been added. Please check the given format and for more assitance use the /help command ');
    });
    }
  });
