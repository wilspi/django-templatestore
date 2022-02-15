import React, { useState, useEffect } from 'react';
import styles from '../style/templateScreen.less';
import axios from 'axios';
import { backendSettings } from './../utils.js';
import Dropdowncomp from './Dropdowncomp';
// import PreviewButton from './PreviewButton';
import { v4 as uuidv4 } from 'uuid';
export default function Tinyurlcomp(props) {
    if (props.contextData === '') return <></>;
    console.log(props.listOfUrls);
    var tinyUrlObjLocal = props.tinyUrlObj;
    // const [items, setItems] = useState([{ id: "initial", urlKey: "", expiry: "" }]);
    const [items, setItems] = useState([]);
    useEffect(() => {console.log(props.tinyUrlObj); populateItems(props.tinyUrlObj);}, [props.tinyUrlObj]);
    function populateItems(tinyUrlObj) {
        if (tinyUrlObj == null) return;
        let temp = [];
        tinyUrlObj.forEach(obj => {
            temp.push({ id: uuidv4(),
                urlKey: obj['urlKey'],
                expiry: obj['expiry'] });
        });
        // console.log(temp);
        setItems(temp);
    }
    // var allowedItems = props.listOfUrls;
    function addNewDropdown() {
        // var id=new Date().getTime().toString();
        var newItems = [...items, { id: uuidv4(), urlKey: "", expiry: "" }];
        setItems(newItems);
    }
    function removeDropdown(e, givenId) {
        e.preventDefault();
        console.log(givenId);
        // allowedItems.push(e.target.value);
        const newItems = items.filter(el => el.id !== givenId);
        console.log(newItems);
        setItems(newItems);
    }
    function handleChange(e, id) {
        e.persist();
        console.log(id, e.target);
        if (e.target.value === "") {
            alert("Choose valid Url and expiry!");
            return;
        }
        var newItems = [...items];
        console.log(e.target.name, e.target.value);
        // if (e.target.name === 'urlKey')allowedItems = allowedItems.filter(el => el !== e.target.value);
        // console.log(allowedItems);
        let index = newItems.findIndex(item => item.id === id);
        // newItems[index]
        // console.log(index);
        newItems[index][e.target.name] = e.target.value;
        console.log(newItems);
        setItems(newItems);
        // console.log(items);
    }
    // function preview() {
    //     let data = {};
    //     let tinyUrlArray = [];
    //     for (let i = 0; i < items.length; i++) {
    //         if (items[i].urlKey === "" || items[i].expiry === "") {
    //             alert("Please choose correct url and expiry");
    //             return;
    //         }
    //         let temp = {};
    //         temp[items[i].urlKey] = items[i].expiry;
    //         tinyUrlArray.push(temp);
    //     }
    //     data['tinyUrlArray'] = tinyUrlArray;
    //     data['templateName'] = props.templateName;
    //     data['templateVersion'] = props.templateVersion;
    //     if (props.setTinyUrlinContextData(data)) return true;
    //     else return false;
    // }
    function arrayChanges() {
        const isSame = (a, b) => a['urlKey'] === b['urlKey'] && a['expiry'] === b['expiry'];
        // Get items that only occur in the left array,
        // using the compareFunction to determine equality.
        const onlyInLeft = (left, right, compareFunction) =>
            left.filter(leftValue =>
                !right.some(rightValue =>
                    compareFunction(leftValue, rightValue)));
        var addedArray, removedArray;
        console.log(typeof (tinyUrlObjLocal), tinyUrlObjLocal);
        if (tinyUrlObjLocal) {
            removedArray = onlyInLeft(tinyUrlObjLocal, items, isSame);
            addedArray = onlyInLeft(items, tinyUrlObjLocal, isSame);
        } else {
            removedArray = [];
            addedArray = items;
        }
        console.log("things removed", removedArray);
        console.log("things added", addedArray);
        return { thingsRemoved: removedArray,
            thingsAdded: addedArray };
    }
    /*eslint-disable */
    function valueSelected(e) {
        e.preventDefault();
        let data = {};
        // let tinyUrlArray = [];
        for (let i = 0; i < items.length; i++) {
            if (items[i].urlKey === "" || items[i].expiry === "") {
                alert("Please choose correct url and expiry");
                return;
            }
            // let temp = {};
            // temp['urlKey'] = items[i].urlKey;
            // temp['expiry'] = items[i].expiry;
            // // temp[items[i].urlKey] = items[i].expiry;
            // tinyUrlArray.push(temp);
        }
        let changes = arrayChanges();
        console.log(changes);
        if (changes['thingsAdded'].length === 0 && changes['thingsRemoved'].length === 0) {
            alert("please modify something");
            return;
        }

        for (var i = 0; i < changes['thingsRemoved'].length; i++) {
            const index = tinyUrlObjLocal.findIndex(obj => obj.urlKey === changes['thingsRemoved'][i].urlKey);
            // if(tinyUrlObjLocal[i].urlKey == id) {
            if (index !== -1)tinyUrlObjLocal.splice(index, 1);
            //     break;
            // }
        }
        if(changes['thingsAdded'].length){
            if(tinyUrlObjLocal)tinyUrlObjLocal = [...tinyUrlObjLocal, ...changes['thingsAdded']];
            else tinyUrlObjLocal=changes['thingsAdded'];
        }
        console.log(tinyUrlObjLocal);
        data['tinyUrlArray'] = tinyUrlObjLocal;
        data['templateName'] = props.templateName;
        data['templateVersion'] = props.templateVersion;
        // let data = JSON.stringify(items);
        console.log(data);
        // props.setTinyUrlinContextData(data);
        axios({
            method: 'post',
            url: backendSettings.TE_BASEPATH + '/generateTinyUrl',
            data: data
        }).then((response) => {
            console.log(response.data);
            alert(response.data.message);
        }).catch((err) => {console.log(err);alert(err)});
    }
    /*eslint-enable */
    // console.log(props.listOfUrls);
    return (
        <>
            {/* <button onClick={() => populateItems(props.tinyUrlObj)}>'@@@'</button> */}
            {/* {console.log(items)} */}
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
                                    <div className="row">
                                        <div className="col">
                                            <form>
                                                {items.map((item, index) => (
                                                    <Dropdowncomp id={item.id} key={item.id} urlKey={item.urlKey} expiry={item['expiry']} handleChange={handleChange} removeDropdown={removeDropdown} listOfUrls={props.listOfUrls}/>
                                                ))}
                                            </form>
                                        </div>
                                    </div>
                                    {items.length < props.listOfUrls.length ?
                                        <button className={styles.teAddNewAttributeButton} onClick={addNewDropdown}>
                                            +
                                        </button> :
                                        ""
                                    }
                                    {<button className={styles.tinyButton} onClick={valueSelected}>Save</button>}
                                    {/* <PreviewButton preview={preview}/> */}
                                    {/* <button onClick={arrayChanges}>ASDASD</button> */}
                                    {/* {items.length > 0 && <button className={styles.tinyButton} onClick={preview}>Preview</button>} */}
                                </div>
                            </div>
                        </div>
                    </div>}
                </div>
            </div>
        </>

    );
}
