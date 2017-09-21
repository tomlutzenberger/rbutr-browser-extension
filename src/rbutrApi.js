/*!
 * Rbutr Browser Extension v0.10.0
 * https://github.com/rbutrcom/rbutr-browser-extension
 *
 * Copyright 2012-2017 The Rbutr Community
 * Licensed under LGPL-3.0
 */

/*exported RbutrApi*/
/*jslint browser:true,esnext:true */



/**
 * @description Multi-Browser support
 */
window.browser = (() => {

    'use strict';

    return window.msBrowser ||
        window.browser ||
        window.chrome;
})();



/**
 * @method RbutrApi
 * @description Class constructor with variable initialisation
 *
 * @param {Object} utils - RbutrUtils object
 * @return {Object} Public object methods
 */
const RbutrApi = (utils) => {

    'use strict';

    const devDomain = 'https://russell.rbutr.com';
    const liveDomain = 'http://rbutr.com';



    /**
     * @method getCid
     * @description Get stored client id or generate and store a new one
     *
     * @param {Boolean} regenerate - Flag to force a complete new generation
     * @return {Number} Unique 17-digit integer
     */
    const getCid = (regenerate) => {

        const CID_KEY = 'rbutr.cid';
        const RAND_NUM_MULTIPLIER = 9000;
        const RAND_NUM_ADDITION = 1000;
        let cid = localStorage.getItem(CID_KEY);

        if (!cid || regenerate === true) {
            let ms = new Date().getTime();
            let rand = Math.floor(RAND_NUM_ADDITION + Math.random() * RAND_NUM_MULTIPLIER);
            cid = ms + rand.toString();
            localStorage.setItem(CID_KEY, cid);
        }

        return parseInt(cid, 10);
    };



    /**
     * @method getServerUrl
     * @description Get server url or just domain
     *
     * @param {Boolean} domainOnly - Flag to control if API URL or only domain will be returned
     * @return {String} URL of the server, may contain only domain
     */
    const getServerUrl = (domainOnly) => {

        let
            domain = utils.isDev() ? devDomain : liveDomain,
            apiPath = domainOnly === true ? '' : '/rbutr/PluginServlet';

        return domain + apiPath;
    };



/*
    const getTags = () => {};
    const updateVote = () => {};
*/


    /**
     * @method loadMenu
     * @description Load menu from server and show message afterwards
     *
     * @param {Function} callback - Callback function to execute
     * @return {void}
     */
    const getMenu = (callback) => {

        const url = utils.buildUrl(getServerUrl(false), {
            getMenu: true,
            version: utils.getExtVersion(),
            cid: getCid()
        });

        makeRequest(url, 'POST', 'text', callback);
    };



    /**
     * @method getRebuttals
     * @description Get rebuttals for given (hashed) URL
     *
     * @param {String} urlHash - MD5 Hash of the desired rebuttal URL
     * @param {Function} callback - Callback function to execute
     * @return {void}
     */
    const getRebuttals = (urlHash, callback) => {

        const url = utils.buildUrl(getServerUrl(), {
            getLinks: true,
            fromPageUrlHash: urlHash,
            version: utils.getExtVersion(),
            cid: getCid()
        });

        makeRequest(url, 'GET', 'text', callback);
    };




    /**
     * @method submitRebuttals
     * @description Submit rebuttal(s)
     *
     * @param {Object} submitParameters - Data to submit
     * @param {Function} callback - Callback function to execute
     * @return {void}
     */
    const submitRebuttals = (submitParameters, callback) => {

        const url = utils.buildUrl(getServerUrl(), Object.assign({},
            {
                submitLinks: true,
                version: utils.getExtVersion(),
                cid: getCid()
            },
            submitParameters
        ));

        makeRequest(url, 'POST', 'json', callback);
    };



    /**
     * @method submitIdea
     * @description Submit rebuttal(s)
     *
     * @param {Object} submitParameters - Data to submit
     * @param {Function} callback - Callback function to execute
     * @return {void}
     */
    const submitIdea = (submitParameters, callback) => {

        const url = utils.buildUrl(getServerUrl(), Object.assign({},
            {
                version: utils.getExtVersion(),
                cid: getCid()
            },
            submitParameters
        ));

        makeRequest(url, 'POST', 'text', callback);
    };



    /**
     * @method submitRebuttalRequest
     * @description Submit a request for rebuttals
     *
     * @param {Object} submitParameters - Data to submit
     * @param {Function} callback - Callback function to execute
     * @return {void}
     */
    const submitRebuttalRequest = (submitParameters, callback) => {

        const url = utils.buildUrl(getServerUrl(), Object.assign({},
            {
                version: utils.getExtVersion(),
                cid: getCid()
            },
            submitParameters
        ));

        makeRequest(url, 'POST', 'text', callback);
    };



    /**
     * @method makeRequest
     * @description Make a request to the server
     *
     * @param {String} url - Request URL
     * @param {String} method - Request method, either "GET" or "POST"
     * @param {String} responseType - Type of response, either "json" or "text" (includes HTML)
     * @param {Function} callback - Callback function to execute
     * @return {void}
     */
    const makeRequest = (url, method, responseType, callback) => {

        fetch(url, {method: method}).then((response) => {
            if (response.ok) {
                return responseType === 'json' ? response.json() : response.text();
            } else {
                throw new Error('Network response was not OK.');
            }
        }).then((result) => {
            callback(true, result);
        }).catch((error) => {
            callback(false, `<pre> ${error.message}</pre>`);
            utils.log('error', 'There has been a problem with your fetch operation: ', error.message);
        });
    };


    return {getCid, getServerUrl, getMenu, getRebuttals, submitRebuttals, submitIdea, submitRebuttalRequest, makeRequest};
};
