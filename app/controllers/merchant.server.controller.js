'use strict';

var _ = require('lodash'),
    db = require('../../config/sequelize'),
    mailer = require('./email.server.controller'),
    roleManager = require('../../config/roleManager'),
    errorHandler = require('./errors');


exports.requestToBeMerchant = requestToBeMerchant;
exports.approvalToBeMerchant = approvalToBeMerchant;
exports.waitingList = waitingList;



function requestToBeMerchant(req, res) {
    var requestApproval = {};

    requestApproval.user_id = req.user.id;
    var msg = {};

    db.merchant_wating_approval.create(requestApproval).then(function() {

        msg.subject = "Request to be a Merchant";
        msg.from = "no-reply@onepercentlab.com";
        msg.to = "hello@onepercentlab.com";
        msg.html = "<p> This is a merchant approval request for " + req.user.firstname + " " + req.user.lastname + "</p>" + "<p> Rating App Support Team</p>";
        mailer(msg);

        return res.status(200).json({message : "Request for Merchant approval sent"});
    }, function(err) {
        return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
        });
    });
};


function approvalToBeMerchant(req, res) {
    db.User.find({where: { id: req.body.user_id } }).then(function(user) {
        if (!user) {
            return res.status(400).json({
                message: errorHandler.getErrorMessage(new Error('Failed to load user ' + id))
            });
        }
        var newBody = {};
        newBody.roleTitle = roleManager.userRoles.merchant.title;
        newBody.roleBitMask = roleManager.userRoles.merchant.bitMask;

        user = _.extend(user, newBody);
        user.updated = Date.now();
        user.save().then(function () {

            db.merchant_wating_approval.find({where: { user_id: user.id } }).then(function(merchantWaiting) {
                merchantWaiting.destroy().then(function() {
                    var msg = {};
                    msg.subject = "Congratulations!!!";
                    msg.from = "no-reply@onepercentlab.com";
                    msg.to = "hello@onepercentlab.com";
                    msg.html = "<p> You are now a merchant. List your businesses now.  " + "<p> Rating App Support Team</p>"
                    mailer(msg);

                    req.login(user, function (err) {
                        if (err) {
                            res.status(400).json(err);
                        } else {
                            res.status(200).json({message : user.firstname + " given merchant access"});
                        }
                    });
                }, function(err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                }); 
            });
            
        }, function(err) {
            return res.status(400).json({
                message: errorHandler.getErrorMessage(err)
            });
        });
    }, function(err) {
        return res.status(400).json({
            message: errorHandler.getErrorMessage(err)
        });
    });
} 


function waitingList(req, res) {
   db.merchant_wating_approval.findAll().then(function(waitingRequests) {
        var completeWaitingList = [];
        var waitingRequestlen = waitingRequests.length;

        _.forEach(waitingRequests, function (waitingRequest, key) {
            db.User.find({where: { id: waitingRequest.user_id } }).then(function(user) {
                if(user) {
                    waitingRequest.dataValues.firstname = user.firstname || "";
                    waitingRequest.dataValues.lastname = user.lastname || "";
                    waitingRequest.dataValues.phone_number = user.phone_number || "";
                    waitingRequest.dataValues.email = user.email || "";

                    completeWaitingList.push(waitingRequest);
                }
                else {
                    completeWaitingList.push(waitingRequest);
                }

                if((key + 1) == waitingRequestlen) {
                     return res.status(200).json(completeWaitingList);
                }
            }, function(err) {
                return res.status(400).json({
                    message: errorHandler.getErrorMessage(err)
                });
            });
        });
    }, function(err) {
        return res.status(400).json({
            message: errorHandler.getErrorMessage(err)
        });
    }); 
}
