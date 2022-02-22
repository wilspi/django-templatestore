import React from 'react';

export function encode(str) {
    try {
        return btoa(
            encodeURIComponent(str).replace(
                /%([0-9A-F]{2})/g,
                function toSolidBytes(match, p1) {
                    return String.fromCharCode('0x' + p1);
                }
            )
        );
    } catch (error) {
        throw new Error(error);
    }
}

export function decode(str) {
    try {
        return decodeURIComponent(
            atob(str)
                .split('')
                .map(function(c) {
                    return (
                        '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
                    );
                })
                .join('')
        );
    } catch (error) {
        throw new Error(error);
    }
}

export function getDateInSimpleFormat(datestr) {
    try {
        let d = new Date(datestr);
        return d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear();
    } catch (error) {
        throw new Error(error);
    }
}

export const backendSettings = JSON.parse(
    document.getElementById('settings-data').textContent.replace(/&quot;/g, '"')
);
export function validateURL(str) {
    var regex = /(?:https?):\/\/(\w+:?\w*)?(\S+)(:\d+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
    return regex.test(str);
}
export function generateNameOfUrl(parent) {
    let ans = "";
    for (let i = 0; i < parent.length; i++) {
        ans += ("['" + parent[i] + "']");
    }
    return ans;
}
export function generateDate(days, months, years) {
    var date = new Date();
    date.setDate(date.getDate() + parseInt(days, 10));
    date.setMonth(date.getMonth() + parseInt(months, 10));
    date.setFullYear(date.getFullYear() + parseInt(years, 10));
    return date.toISOString();
}
