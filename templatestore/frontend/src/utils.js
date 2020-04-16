import React from 'react';

export function encode(str) {
    var encodedString = window.btoa(encodeURIComponent(str));
    return encodedString;
}

export function decode(str) {
    var decodedString = decodeURIComponent(window.atob(str));
    return decodedString;
}
