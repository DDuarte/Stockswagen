'use strict';

const Later = require('later'),
      _ = require('lodash'),
      Co = require('co'),
      Config = require('config'),
      Finance = require('yahoo-finance'),
      Firebase = require('firebase'),
      Fireproof = require('fireproof'),
      ionicPushServer = require('ionic-push-server'),
      Portfolios = new Fireproof(new Firebase(Config.firebase.collections.portfolios)),
      Quotes = new Fireproof(new Firebase(Config.firebase.collections.quotes)),
      TokensRef = new Firebase(Config.firebase.collections.tokens)

class PushNotificationsSubscriber {

    static schedule(scheduleText) {
        let sched = Later.parse.text(scheduleText);

        if (sched.error !== -1) {
            throw new Error(`The text schedule expression is invalid: ${scheduleText}`);
        }

        return Later.setInterval(this._sendPushNotifications, sched);
    }

    static _sendPushNotifications() {
        return Co(function* () {

            console.log("Sending push notifications...");

            let portfolios = yield Portfolios;
            let quotes = yield Quotes;

            _.forOwn(portfolios.val(), (val, key) => {
                let subscriptions =  _.filter(_.values(val), p => p.subscription);

                subscriptions.forEach(sub => {
                    let tick = sub.tick;
                    let quote = quotes.child(tick).val();
                    let price = quote.lastTradePriceOnly;

                    if (price < sub.lowerBound) {
                        PushNotificationsSubscriber.sendNotification(key, tick, false, price, sub.lowerBound);
                    } else if (price > sub.upperBound) {
                        PushNotificationsSubscriber.sendNotification(key, tick, true, price, sub.upperBound);
                    }
                });
            });
        })
        .catch((error) => {
            console.error('Error in PushNotificationsSubscriber:', error);
        });
    }

    static sendNotification(userId, symbol, isHigher, value, bound) {

        TokensRef.once('value', (snapshot) => {
            let tokenSnapshot = snapshot.child(userId);
            let token = tokenSnapshot.val();

            if (token != null) {

                console.log("Sending to ", userId, " token ", token, " tick ", symbol);

                var alert = '';
                if (isHigher) {
                    alert = symbol + ' is higher than $' + bound + ' ($' + value + ')';
                } else {
                    alert = symbol + ' is lower than $' + bound + ' ($' + value + ')';
                }

                let notification = {
                    "tokens": [token],
                    "notification": {
                        "alert": alert
                    }
                };

                let credentials = {
                    IonicApplicationID : Config.ionic.appId,
                    IonicApplicationAPIsecret : Config.ionic.apiSecret
                };

                ionicPushServer(credentials, notification).then(() => { }, (err) => {
                    console.log(err);
                });
            }
        });
    }
}

module.exports = PushNotificationsSubscriber;
