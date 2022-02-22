import React, { useState, useEffect } from 'react';
import styles from '../style/templateScreen.less';
import axios from 'axios';
import { backendSettings } from './../utils.js';
import Dropdowncomp from './Dropdowncomp';
export default function Tinyurlcomp(props) {
    if (props.contextData === '') return <></>;
    var tinyUrlObjLocal = props.tinyUrlObj;
    const [items, setItems] = useState([{ urlKey: "", expiry: "" }]);
    const [visited, setVisited] = useState({});
    useEffect(() => {populateItems(props.tinyUrlObj);}, [props.tinyUrlObj]);
    function populateItems(tinyUrlObj) {
        if (tinyUrlObj.length === 0) return;
        let temp = [...items];
        let tempvisited = { ...visited };
        tinyUrlObj.forEach(obj => {
            tempvisited[obj['urlKey']] = 1;
            temp.splice(temp.length - 1, 0, {
                urlKey: obj['urlKey'],
                expiry: obj['expiry'] });
        });
        setVisited(tempvisited);
        setItems(temp);
    }
    function addNewDropdown() {
        if (items.length) {
            if (items[items.length - 1]['urlKey'] === "" || items[items.length - 1]['expiry'] === "") {
                props.showAlerts("Please select valid values first");
                return;
            }
        }
        var newItems = [...items, { urlKey: "", expiry: "" }];
        setItems(newItems);
    }
    function removeDropdown(e, givenId) {
        e.preventDefault();
        const newItems = items.filter(el => el.urlKey !== givenId);
        let tempvisited = { ...visited };
        delete tempvisited[givenId]; // eslint-disable-line
        setVisited(tempvisited);
        setItems(newItems);
    }
    function handleChange(e, id) {
        e.persist();
        if (e.target.value === "") {
            props.showAlerts("Choose valid Url and expiry");
            return;
        }
        var newItems = [...items];
        let tempvisited = { ...visited };
        if (e.target.name === 'urlKey') {
            tempvisited[e.target.value] = 1;
            if (id !== "") {
                delete tempvisited[id]; // eslint-disable-line
            }
            setVisited(tempvisited);
        }
        let index = newItems.findIndex(item => item.urlKey === id);
        newItems[index][e.target.name] = e.target.value;
        setItems(newItems);
    }

    function arrayChanges() {
        const isSame = (a, b) => a['urlKey'] === b['urlKey'] && a['expiry'] === b['expiry'];
        // Get items that only occur in the left array,
        // using the compareFunction to determine equality.
        const onlyInLeft = (left, right, compareFunction) =>
            left.filter(leftValue =>
                !right.some(rightValue =>
                    compareFunction(leftValue, rightValue)));
        var addedArray, removedArray;
        if (tinyUrlObjLocal) {
            removedArray = onlyInLeft(tinyUrlObjLocal, items, isSame);
            addedArray = onlyInLeft(items, tinyUrlObjLocal, isSame);
        } else {
            removedArray = [];
            addedArray = items;
        }
        return { thingsRemoved: removedArray,
            thingsAdded: addedArray };
    }
    /*eslint-disable */
    function valueSelected(e) {
        e.preventDefault();
        let data = {};
        for (let i = 0; i < items.length; i++) {
            if (items[i].urlKey === "" || items[i].expiry === "") {
                // alert("Please choose correct url and expiry");
                props.showAlerts("Can't leave url or expiry blank");
                return;
            }
        }
        let changes = arrayChanges();
        if (changes['thingsAdded'].length === 0 && changes['thingsRemoved'].length === 0) {
            props.showAlerts("Please modify something");
            return;
        }

        for (var i = 0; i < changes['thingsRemoved'].length; i++) {
            const index = tinyUrlObjLocal.findIndex(obj => obj.urlKey === changes['thingsRemoved'][i].urlKey);
            if (index !== -1)tinyUrlObjLocal.splice(index, 1);
        }
        if(changes['thingsAdded'].length){
            if(tinyUrlObjLocal)tinyUrlObjLocal = [...tinyUrlObjLocal, ...changes['thingsAdded']];
            else tinyUrlObjLocal=changes['thingsAdded'];
        }
        data['tinyUrlArray'] = tinyUrlObjLocal;
        data['templateName'] = props.templateName;
        data['templateVersion'] = props.templateVersion;
        axios({
            method: 'put',
            url: backendSettings.TE_BASEPATH + '/generate_tiny_url',
            data: data
        }).then((response) => {
            props.showAlerts(response.data.message);
        }).catch((err) => {props.showAlerts(err);});
    }
    /*eslint-enable */
    return (
        <>
            <div className={styles.teMarginTop20}>
                <label>TinyUrl: </label>
            </div>
            <div
                className={styles.teAccordian + ' accordion md-accordion'}
                id="accordionEx2"
                role="tablist"
                aria-multiselectable="true"
            >
                <div className={styles.teScreenTable}>
                    {<div className={styles.teCard + ' card'}>
                        <div
                            className="card-header"
                            role="tab"
                            id="headingTwo22"
                        >
                            <a
                                data-toggle="collapse"
                                data-parent="#accordionEx2"
                                href="#collapseTwo22"
                                aria-expanded="true"
                                aria-controls="collapseTwo22"
                            >
                                <h5 className="mb-0">
                                    URLs{' '}
                                    <i className="fas fa-angle-down rotate-icon" />
                                </h5>
                            </a>
                        </div>
                        <div
                            id="collapseTwo22"
                            className="collapse"
                            role="tabpanel"
                            aria-labelledby="headingTwo22"
                            data-parent="#accordionEx2"
                        >
                            <div className="card-body">
                                <div className={styles.teAttributesWrapper}>
                                    {items.map((item, index) => (
                                        <Dropdowncomp id={item.urlKey} key={item.urlKey} urlKey={item.urlKey} expiry={item.expiry} handleChange={handleChange} removeDropdown={removeDropdown} listOfUrls={props.listOfUrls} visited={visited}/>
                                    ))}
                                    {items.length < props.listOfUrls.length ?
                                        <button
                                            className={styles.teAddNewAttributeButton}
                                            onClick={addNewDropdown}
                                        >
                                            +
                                        </button> :
                                        ""
                                    }
                                    <button
                                        className={styles.teUpdateButton}
                                        onClick={valueSelected}
                                    >
                                        Update
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>}
                </div>
            </div>
        </>

    );
}
