exports.handler = async function(event) {
    var headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers, body: '' };
    }

    try {
        var body = JSON.parse(event.body || '{}');
        var publicIds = body.public_ids || [];
        var resourceType = body.resource_type || 'image';

        if (!publicIds.length) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'No public_ids provided' }) };
        }

        var cloudName = 'dcj7lqvph';
        var apiKey = '921952292183516';
        var apiSecret = 'KvIBlQmme4C4S-deeYj5B9O8wWY';

        var auth = 'Basic ' + Buffer.from(apiKey + ':' + apiSecret).toString('base64');

        if (publicIds.length === 1) {
            var url = 'https://api.cloudinary.com/v1_1/' + cloudName + '/' + resourceType + '/upload/' + encodeURIComponent(publicIds[0]);
            var res = await fetch(url, { method: 'DELETE', headers: { 'Authorization': auth } });
            var data = await res.json();
            return { statusCode: res.status, headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify(data) };
        }

        var deleteUrl = 'https://api.cloudinary.com/v1_1/' + cloudName + '/resources/' + resourceType + '/upload';
        var res = await fetch(deleteUrl, {
            method: 'DELETE',
            headers: { 'Authorization': auth, 'Content-Type': 'application/json' },
            body: JSON.stringify({ public_ids: publicIds })
        });
        var data = await res.json();
        return { statusCode: res.status, headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify(data) };
    } catch (e) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
    }
};
