var mailer = require('./email.server.controller');

exports.receiveEmailandPostIt = receiveEmailandPostIt;


function receiveEmailandPostIt(req, res) {

    var emailContent = req.body;
    var emailName = emailContent.name || "No-Name-Specified";
    var emailFrom = emailContent.email || "no-reply@raytee.com";
    
    var msg = {};
    msg.subject = "Message from " + emailName;
    msg.from = emailFrom;
    msg.to = "hello@raytee.com";
    msg.html = "<p>" + emailContent.message + "<p>" + "<p>" + "Message from " + emailName;
    mailer(msg, function() {
        res.status(200).json({message: "Message Sent"});
    });

}
