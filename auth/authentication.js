const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const pino = require('../fepsApp-BE').pino;
var ejwt = require('express-jwt');
let cache = require('memory-cache');
const securtiyUtil = require('../fepsApp-BE').securtiyUtil;
const renderResponseUtil = require('../fepsApp-BE').renderResponseUtil;
const passport = require('passport');
const ErrorMessage = require('../fepsApp-BE').ErrorMessage;
const ModelUtil = require('../fepsApp-BE').ModelUtil;
const Message = require('../fepsApp-BE').Message;
const MailUtil = require('../fepsApp-BE').mailUtil;
const CONSTANTS = require('../fepsApp-BE').constants;
const messages = require('../fepsApp-BE').messages;
router.post('/login', function(req, res) {

  passport.authenticate('local', function(err, user, info){
    var token;

    // If Passport throws/catches an error
    if (err) {
      res.status(404).json(err);
      return;
    }

    // If a user is found
    if(user){
      token = securtiyUtil.generateJwt(user);
      res.status(200);
      const groups = cache.get(CONSTANTS.documents.type.groups);
      const realGroups = [];
      if(user.groups){
        for(let i = 0; i < user.groups.length; i++){
          if(groups[user.groups[i].name]){
              realGroups.push(groups[user.groups[i].name]);
          }
        }
        user.groups = realGroups;
      }
      delete user.salt;
      delete user.hash;
      res.json({
        "token" : token,
        "user" : user
      });
    } else {
      // If user is not found
      res.status(401).json(info);
    }
  })(req, res);

});

router.post('/authenticated', (req, res)=>{
  const token = req.body.token;

  if(token){
    securtiyUtil.verifyToken(token).then((decodedUser)=>{
      const newToken = securtiyUtil.generateJwt(decodedUser);
      res.json({"token" : newToken});
    },(err)=>{
      return res.status(401).json({success: false, message: 'Failed to authenticate token.', err: err});
    });
  }else{
    const errorMessage = new ErrorMessage(ErrorMessage.MISSING_PARAMETER, "token is missing");
    res.status(401).send(errorMessage);
  }


});

router.post('/forget-password', (req, res)=>{

  const email = req.body.email;
  const query = {"email" : email};

  if(email){
    ModelUtil.findByQuery(query).then((users)=>{
      if(users){
        const token = securtiyUtil.generateJWTBasedOnTime({email : email, hash : users[0].hash}, process.env.FORGET_PASSWORD_LINK);
        let url = CONSTANTS.app_url + '/?token=' + token;
        MailUtil.sendEmail(CONSTANTS.mail.forget_password, CONSTANTS.mailTemplates.forget_password, "Forget password link",{"user" : users[0], "url" : url}, CONSTANTS.language.en, email).then((info)=>{
          let message = new Message(Message.EMAIL_SENT, null, messages.businessMessages.email_sent_success);
          res.send(message);
        }, (err)=>{
          let errorMessage = new ErrorMessage(ErrorMessage.EMAIL_ERROR, err);
          res.send(err);
        });
      }else{
        let errorMessage = new ErrorMessage(ErrorMessage.OBJECT_NOT_FOUND, null);
        res.json(errorMessage);
      }
    }, (err)=>{
      res.send(err);
    });
  }else{
    let errorMessage = new ErrorMessage(ErrorMessage.MISSING_PARAMETER, "email is missing");
    res.send(errorMessage);
  }

});

router.post('/reset-password', (req, res)=>{
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  if(password === confirmPassword){
    const token = req.headers.authorization;
    securtiyUtil.verifyToken(token).then((decodedUser)=>{
      ModelUtil.findByQuery({email : decodedUser.email}).then((users)=>{
        let user = users[0];
        securtiyUtil.setPassword(user, password);
        ModelUtil.updateDoc(user).then((result)=>{
          let message = new Message(Message.RESET_PASSWORD, result, messages.businessMessages.resetـpassword_success);
          res.json(message);
        }, (err)=>{
          let errorMessage = new ErrorMessage(ErrorMessage.DATABASE_ERROR, err);
          res.status(500).send(err);
        });
      }, (err)=>{

      });
    },(err)=>{
      let errorMessage = new ErrorMessage(ErrorMessage.AUTHENTICATION_ERROR, err);
      res.status(401).send(errorMessage);
    })
  }else{
    let errorMessage = new ErrorMessage(ErrorMessage.VALIDATION_ERROR, messages.errorMessages.match_confirm_password_error);
    res.json(errorMessage);
  }
})
module.exports = router;
