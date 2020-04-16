import React from 'react';

export function encode(str) {
    // First we escape the string using encodeURIComponent to get the UTF-8 encoding of the characters,
    // then we convert the percent encodings into raw bytes, and finally feed it to btoa() function.
    let utf8Bytes = encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
        return String.fromCharCode('0x' + p1);
    });
    console.log("encode", str, btoa(utf8Bytes));
    return btoa(utf8Bytes);
}

export function decode(str) {
    // Convert Base64 encoded bytes to percent-encoding, and then get the original string.
    let percentEncodedStr = atob(str).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join('');
    console.log("Decode", str, percentEncodedStr);
    return decodeURIComponent(percentEncodedStr);
}
