import React from 'react';
import styles from '../style/templateScreen.less';
import axios from 'axios';
import { backendSettings } from './../utils.js';
import TinyUrlDropdownComponent from './TinyUrlDropdownComponent';

export default function TinyUrlComponent(props) {
    let tinyUrlObjLocal = props.tinyUrlObj;

    function addNewDropdown() {
        if (props.items.length) {
            if (props.items[props.items.length - 1].urlKey === "" || props.items[props.items.length - 1].expiry === "") {
                props.showAlerts("Please select valid values first");
                return;
            }
        }
        let newItems = [...props.items, { urlKey: "", expiry: "" }];
        props.updateItems(newItems);
    }

    function removeDropdown(e, givenId) {
        e.preventDefault();
        const newItems = props.items.filter(el => el.urlKey !== givenId);
        let visitedCopy = { ...props.visited };
        visitedCopy[givenId] = 0;
        props.updateItems(newItems);
        props.updateVisited(visitedCopy);
    }

    function handleChange(e, id) {
        e.persist();
        if (e.target.value === "") {
            props.showAlerts("Choose valid Url and expiry");
            return;
        }
        let newItems = [...props.items];
        let visitedCopy = { ...props.visited };
        if (e.target.name === 'urlKey') {
            visitedCopy[e.target.value] = 1;
            if (id !== "") {
                visitedCopy[id] = 0;
            }
            props.updateVisited(visitedCopy);
        }
        let index = newItems.findIndex(item => item.urlKey === id);
        newItems[index][e.target.name] = e.target.value;
        props.updateItems(newItems);
    }

    function arrayChanges() {
        const isSame = (a, b) => a.urlKey === b.urlKey && a.expiry === b.expiry;
        // Get props.items that only occur in the left array,
        // using the compareFunction to determine equality.
        const onlyInLeft = (left, right, compareFunction) =>
            left.filter(leftValue =>
                !right.some(rightValue =>
                    compareFunction(leftValue, rightValue)));
        let addedArray, removedArray;
        if (tinyUrlObjLocal) {
            removedArray = onlyInLeft(tinyUrlObjLocal, props.items, isSame);
            addedArray = onlyInLeft(props.items, tinyUrlObjLocal, isSame);
        } else {
            removedArray = [];
            addedArray = props.items;
        }
        return { itemsRemoved: removedArray,
            itemsAdded: addedArray };
    }

    function valueSelected(e) {
        e.preventDefault();
        let data = {};
        for (let i = 0; i < props.items.length; i++) {
            if (props.items[i].urlKey === "" || props.items[i].expiry === "") {
                props.showAlerts("Can't leave url or expiry blank");
                return;
            }
        }
        let changes = arrayChanges();
        if (changes.itemsAdded.length === 0 && changes.itemsRemoved.length === 0) {
            props.showAlerts("Please modify something");
            return;
        }

        for (let i = 0; i < changes.itemsRemoved.length; i++) {
            const index = tinyUrlObjLocal.findIndex(obj => obj.urlKey === changes.itemsRemoved[i].urlKey); // eslint-disable-line
            if (index !== -1)tinyUrlObjLocal.splice(index, 1);
        }
        if (changes.itemsAdded.length) {
            if (tinyUrlObjLocal)tinyUrlObjLocal = [...tinyUrlObjLocal, ...changes.itemsAdded];
            else tinyUrlObjLocal = changes.itemsAdded;
        }
        data.tinyUrlArray = tinyUrlObjLocal;
        data.templateName = props.templateName ? props.templateName : "";
        data.templateVersion = props.templateVersion ? props.templateVersion : "";
        axios({
            method: 'put',
            url: backendSettings.TE_BASEPATH + '/api/v1/tiny_url',
            data: data
        }).then((response) => {
            props.showAlerts(response.data.message);
        }).catch((err) => {props.showAlerts(err.response.data);});
    }

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
                                    {props.items.map((item, index) => (
                                        <TinyUrlDropdownComponent id={item.urlKey} key={item.urlKey} urlKey={item.urlKey} expiry={item.expiry} handleChange={handleChange} removeDropdown={removeDropdown} urlKeyList={props.urlKeyList} visited={props.visited}/>
                                    ))}
                                    {props.items.length < props.urlKeyList.length ?
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
