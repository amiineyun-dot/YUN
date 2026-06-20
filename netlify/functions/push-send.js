// Netlify Function: push-send
// Sends Web Push notifications to all stored subscriptions

var webPush = require('web-push');

var VAPID_PUBLIC_KEY = 'NPgx8b0AeT22n48EXSYdT0XkRpSrxP9WQWVP-aUXCuw';
var VAPID_PRIVATE_KEY = '1u27ZkmKvJjTaS72ZblB2_XFoucknzRkHLw5gDA3DI0';

webPush.setVapidDetails(
    'mailto:admin@yunstore.dz',
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
);

exports.handler = async function(event) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    try {
        var body = JSON.parse(event.body);
        var title = body.title || 'YUN Admin';
        var message = body.body || 'New notification';
        var url = body.url || '/admin/index.html';
        var subscriptions = body.subscriptions || [];

        if (!subscriptions.length) {
            return { statusCode: 200, body: JSON.stringify({ sent: 0, message: 'No subscriptions' }) };
        }

        var payload = JSON.stringify({ title: title, body: message, url: url, tag: 'yun-order-' + Date.now() });

        var results = await Promise.allSettled(
            subscriptions.map(function(sub) {
                var pushSubscription = { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } };
                return webPush.sendNotification(pushSubscription, payload, { TTL: 86400 });
            })
        );

        var sent = results.filter(function(r) { return r.status === 'fulfilled'; }).length;
        var failed = results.filter(function(r) { return r.status === 'rejected'; });

        // Log failed subscriptions for cleanup
        var failedEndpoints = [];
        failed.forEach(function(r, i) {
            if (r.reason && r.reason.statusCode === 404) {
                failedEndpoints.push(subscriptions[i].endpoint);
            }
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ sent: sent, failed: failed.length, cleanup: failedEndpoints.length })
        };
    } catch(e) {
        return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
    }
};
