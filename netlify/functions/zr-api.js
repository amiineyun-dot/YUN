exports.handler = async function(event) {
    var ZR_BASE = 'https://api.zrexpress.app/api/v1';
    var headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers, body: '' };
    }

    try {
        var body = JSON.parse(event.body || '{}');
        var apiKey = body.apiKey;
        var tenantId = body.tenantId;
        var path = body.path || '/users/profile';
        var method = body.method || 'GET';
        var payload = body.body || null;

        if (!apiKey || !tenantId) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing apiKey or tenantId' }) };
        }

        var fetchOpts = {
            method: method,
            headers: {
                'X-Api-Key': apiKey,
                'X-Tenant': tenantId,
                'accept': 'application/json'
            }
        };

        if (payload && method !== 'GET') {
            fetchOpts.headers['Content-Type'] = 'application/json';
            fetchOpts.body = JSON.stringify(payload);
        }

        var res = await fetch(ZR_BASE + path, fetchOpts);
        var data = await res.text();

        return {
            statusCode: res.status,
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: data
        };
    } catch (e) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
    }
};
