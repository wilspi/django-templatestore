import React from 'react';

export function encode(str) {
    var encodedString = btoa(str);
    return encodedString;
}

export function decode(str) {
    var decodedString = atob(str);
    return decodedString;
}