
'use strict';

const res = (statusCode, body) => {
    return {
        statusCode: statusCode,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(body),
    };
}

module.exports = {
    res
}