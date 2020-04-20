import React from 'react';

export function encode(str) {
    var encodedString = btoa(str);
    return encodedString;
}

export function decode(str) {
    var decodedString = atob(str);
    return decodedString;
}

export const backendSettings = JSON.parse(
    document.getElementById('settings-data').textContent.replace(/&quot;/g, '"')
);
