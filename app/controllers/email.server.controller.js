var api_key = 'key-56d8fcf90a99fa73da7494aa0f7b0b39';
    var domain = 'sandboxf405e13ea86f4f47b3087ec341a42786.mailgun.org';
    var mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});

module.exports = function(msg, cb) {
 
    var data = {
        from: msg.from,
        to: msg.to,
        subject: msg.subject,
        html: msg.html
    };
     
    mailgun.messages().send(data, function (error, body) {
        if(error) {
            console.log(error, "Mail post error >>> Mailgun");
        }
        
        if(cb) {cb();}
        
    });
};