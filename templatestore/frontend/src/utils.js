import React from 'react';

export function encode(str) {
    try {
        var encodedString = btoa(str);
        return encodedString;
    } catch (error) {
        throw new Error(error);
    }
}

export function decode(str) {
    try {
        var decodedString = atob(str);
        return decodedString;
    } catch (error) {
        throw new Error(error);
    }
}

export function getDateInSimpleFormat(datestr) {
    try {
        let d = new Date(datestr);
        return d.getDate() + '/' + d.getMonth() + '/' + d.getFullYear();
    } catch (error) {
        throw new Error(error);
    }
}

export const backendSettings = JSON.parse(
    document.getElementById('settings-data').textContent.replace(/&quot;/g, '"')
);
