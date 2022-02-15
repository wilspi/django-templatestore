// // import Dropdowncomp from './Dropdowncomp';
// import styles from './../style/templateScreen.less';
// import React from 'react';
// import axios from 'axios';
// import { backendSettings } from './../utils.js';
// var noOfurl = 1;
// export default function Tinyurlcomp(props) {
//     // function generateRequestBody(urlKey, expiry) {
//     //     console.log(lob);
//     //     // if (lob === "") lob = 'auto';
//     //     // if (journey === "") journey = 'policy';
//     //     return {
//     //         urlKey:expiry
//     //     };
//     // }
//     function valueSelected(e) {
//         let data = {};
//         e.preventDefault();
//         e.persist();
//         for (let i = 1; i <= noOfurl; i++) {
//             let urlKey = "e.target.url" + i + ".value";
//             let expiry = "e.target.expiry" + i + ".value";
//             urlKey = eval(urlKey);
//             expiry = eval(expiry);
//             const [days, months, years] = expiry.split(',');
//             console.log(days, months, years, typeof (days));
//             if (urlKey === "" || urlKey === undefined || days === undefined || days === "") {
//                 alert("Please choose correct Data and expiry date.");
//                 return;
//             }
//             const expiryDate = generateDate(days, months, years);
//             console.log(urlKey, expiryDate);
//             data[urlKey] = expiryDate;
//             console.log(eval(urlKey), eval(expiry));
//         }
//         // console.log(JSON.stringify(data));
//         axios({
//             method: 'post',
//             url: backendSettings.TE_BASEPATH + '/generateTinyUrl',
//             data: data
//         }).then((response) => {
//             // console.log(response);
//             alert("Saved");
//         }).catch((err) => {console.log(err);});
//     }
//     if (props.contextData === '') return <></>;

//     // const [items, setItems] = useState([<Dropdowncomp key={"dropdown" + noOfurl} handleEvent={props.handleEvent} data={props.contextData} attributes={props.attributes} valueSelected={valueSelected} noOfUrl={noOfurl} removeDropdown={removeDropdown} mandatory/>]);
//     // const addDropdown = () => {
//     //     ++noOfurl;
//     //     setItems([...items, <Dropdowncomp key={"dropdown" + noOfurl} handleEvent={props.handleEvent} data={props.contextData} attributes={props.attributes} valueSelected={valueSelected} noOfUrl={noOfurl} removeDropdown={removeDropdown} mandatory={false}/>]);
//     //     // console.log(items.length);
//     // };

//     return (
//         <>
//             {/* for(var i=0; i<10;i++) */}
//             <div className={styles.teMarginTop20}>
//                 <label>TinyUrl: </label>
//             </div>
//             <div
//                 className={styles.teAccordian + ' accordion md-accordion'}
//                 id="accordionEx2"
//                 role="tablist"
//                 aria-multiselectable="true"
//             >
//                 <div className={styles.teScreenTable}>
//                     {<div className={styles.teCard + ' card'}>
//                         <div
//                             className="card-header"
//                             role="tab"
//                             id="headingTwo22"
//                         >
//                             <a
//                                 data-toggle="collapse"
//                                 data-parent="#accordionEx2"
//                                 href="#collapseTwo22"
//                                 aria-expanded="true"
//                                 aria-controls="collapseTwo22"
//                             >
//                                 <h5 className="mb-0">
//                                     URLs{' '}
//                                     <i className="fas fa-angle-down rotate-icon" />
//                                 </h5>
//                             </a>
//                         </div>
//                         <div
//                             id="collapseTwo22"
//                             className="collapse"
//                             role="tabpanel"
//                             aria-labelledby="headingTwo22"
//                             data-parent="#accordionEx2"
//                         >
//                             <div className="card-body">
//                                 <div className={styles.teAttributesWrapper}>
//                                     <div className="row">
//                                         <div className="col">
//                                             <form onSubmit={valueSelected}>
//                                                 {/* {items} */}
//                                                 {/* {items.map()} */}
//                                                 <button type="Submit" className={styles.tinyButton}>Save</button>
//                                             </form>
//                                         </div>
//                                     </div>
//                                     {/* <button
//                                         className={styles.teAddNewAttributeButton}
//                                         onClick={addDropdown}
//                                     > */}
//                                         +
//                                     {/* </button> */}
//                                     {/* <Dropdowncomp handleEvent={props.handleEvent} data={props.contextData} attributes={props.attributes} /> */}
//                                     {/* {console.log(items.length)} */}
//                                 </div>
//                             </div>
//                         </div>
//                     </div>}
//                 </div>
//             </div>
//         </>
//     );
// }

