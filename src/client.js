/**
 * Created by godong on 2016. 3. 9..
 */
/*jshint browser:false*/
/**
 * Require modules
 */
import { isString, isObject, isFunction } from "underscore";
import fetch from "node-fetch";
import log4js from "@log4js-node/log4js-api";
var logger = log4js.getLogger("solr-node");
import { stringify } from "querystring";

/**
 * Solr Node Client
 *
 * @constructor
 *
 * @param {Object} options
 * @param {String} [options.host] - host address of Solr server
 * @param {Number|String} [options.port] - port number of Solr server
 * @param {String} [options.core] - client core name
 * @param {String} [options.user] - client user name
 * @param {String} [options.password] - client password name
 * @param {String} [options.rootPath] - solr root path
 * @param {String} [options.protocol] - request protocol ('http'|'https')
 */
class Client {
  constructor(options) {
    this.options = {
      host: options.host || "127.0.0.1",
      port: options.port || "",
      core: options.core || "",
      rootPath: options.rootPath || "solr",
      protocol: options.protocol || "http",
    };
    // Optional Authentication
    if (options.user && options.password) {
      this.options.user = options.user;
      this.options.password = options.password;
    }

    // Path Constants List
    this.SEARCH_PATH = "select";
    this.TERMS_PATH = "terms";
    this.SPELL_PATH = "spell";
    this.MLT_PATH = "mlt";
    this.UPDATE_PATH = "update";
    this.UPDATE_EXTRACT_PATH = "update/extract";
    this.PING_PATH = "admin/ping";
    this.SUGGEST_PATH = "suggest";
    this.STREAM_PATH = "stream";
  }
  /**
   * Make host url
   * @private
   *
   * @param {String} protocol - protocol ('http'|'https')
   * @param {String} host - host address
   * @param {String|Number} port - port number
   * @param {String} user - user basic auth
   * @param {String} password - password basic auth
   *
   * @returns {String}
   */
  _makeHostUrl(protocol, host, port, user, password) {
    let auth = "";
    if (user && password) {
      auth =
        encodeURIComponent(user) + ":" + encodeURIComponent(password) + "@";
    }
    if (port) {
      return protocol + "://" + auth + host + ":" + port;
    } else {
      return protocol + "://" + auth + host;
    }
  }
  /**
   * Make a call to Solr server
   * @private
   *
   * @param requestFullPath - URL sent to Solr server
   * @param {Object} fetchOptions - options for fetch method
   *
   * @returns {Promise} - it returns a Promise
   */
  _callSolrServer(requestFullPath, fetchOptions) {
    return fetch(requestFullPath, fetchOptions).then(function (res) {
      if (res.status !== 200) {
        logger.error(res);
        throw new Error("Solr server error: " + res.status);
      } else {
        return res.json();
      }
    });
  }
  /**
   * Request get
   *
   * @param {String} path - target path
   * @param {Object} query - query
   *
   * @returns {Promise} - it returns a Promise
   */
  _requestGet(
    path,
    query,
    headers = {
      accept: "application/json; charset=utf-8",
    }
  ) {
    var options, requestPrefixUrl, requestFullPath;

    const params = new URLSearchParams(query);

    requestPrefixUrl = this._makeHostUrl(
      this.options.protocol,
      this.options.host,
      this.options.port,
      this.options.user,
      this.options.password
    );
    requestPrefixUrl +=
      "/" + [this.options.rootPath, this.options.core, path].join("/");

    requestFullPath = requestPrefixUrl + "?" + params.toString();

    logger.debug("[_requestGet] requestFullPath: ", requestFullPath);

    options = {
      method: "GET",
      headers,
    };

    return this._callSolrServer(requestFullPath, options);
  }
  /**
   * Request post
   *
   * @param {String} path - target path
   * @param {Object} data - json data
   * @param {Object|String} urlOptions - url options
   *
   * @returns {Promise} - it returns a Promise
   */
  _requestPost(
    path,
    data,
    urlOptions,
    headers = {
      accept: "application/json; charset=utf-8",
      "content-type": "application/json; charset=utf-8",
    }
  ) {
    var options, requestPrefixUrl, requestFullPath;

    const params = new URLSearchParams(urlOptions);

    requestPrefixUrl = this._makeHostUrl(
      this.options.protocol,
      this.options.host,
      this.options.port,
      this.options.user,
      this.options.password
    );
    requestPrefixUrl +=
      "/" + [this.options.rootPath, this.options.core, path].join("/");

    requestFullPath = requestPrefixUrl + "?" + params.toString();

    logger.debug("[_requestPost] requestFullPath: ", requestFullPath);
    logger.debug("[_requestPost] data: ", data);

    options = {
      method: "POST",
      body: data,
      headers,
    };

    return this._callSolrServer(requestFullPath, options);
  }
  /**
   * Stream
   *
   * @param {Object} query
   *
   * @returns {Promise} - it returns a Promise
   */

  stream(query, trimEof = true, method = "GET") {
    return (
      method === "GET"
        ? this._requestGet(this.STREAM_PATH, query)
        : this._requestPost(
            this.STREAM_PATH,
            new URLSearchParams(query),
            {},
            {
              "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
            }
          )
    ).then((response) => {
      const result = response["result-set"];

      if (!result || !result.docs || !result.docs.length) {
        throw new Error("No result-set/docs in response");
      }

      const error = result.docs[result.docs.length - 1]["EXCEPTION"];

      if (error) {
        throw new Error(error);
      }

      if (trimEof && result.docs[result.docs.length - 1]["EOF"]) {
        result.docs.pop(); // trims EOF
      }

      return result.docs;
    });
  }
  /**
   * Search
   *
   * @param {Object} query
   *
   * @returns {Promise} - it returns a Promise
   */
  search(query, method = "GET") {
    return method === "GET"
      ? this._requestGet(this.SEARCH_PATH, query)
      : this._requestPost(
          this.SEARCH_PATH,
          JSON.stringify({ params: query }),
          ""
        );
  }
  /**
   * Terms
   *
   * @param {Object} query
   *
   * @returns {Promise} - it returns a Promise
   */
  terms(query) {
    return this._requestGet(this.TERMS_PATH, query);
  }
  /**
   * Mlt
   *
   * @param {Object} query
   *
   * @returns {Promise} - it returns a Promise
   */
  mlt(query) {
    return this._requestGet(this.MLT_PATH, query);
  }
  /**
   * Spell
   *
   * @param {Object} query
   *
   * @returns {Promise} - it returns a Promise
   */
  spell(query) {
    return this._requestGet(this.SPELL_PATH, query);
  }
  /**
   * Update
   *
   * @param {Object} data - json data
   * @param {Object|Function} [options] - update options
   *
   * @returns {Promise} - it returns a Promise
   */
  update(data, options) {
    var bodyData;
    if (arguments.length < 3 && isFunction(options)) {
      options = { commit: true }; // 'commit:true' option is default
    }
    bodyData = {
      add: {
        doc: data,
        overwrite: true,
      },
    };

    return this._requestPost(
      this.UPDATE_PATH,
      JSON.stringify(bodyData),
      options
    );
  }
  /**
   * Update Extract (files to be indexed via Tika using stream.* param)
   *
   * @param {Object|Function} [options] - update options
   *
   * @returns {Promise} - it returns a Promise
   */
  updateExtract(options) {
    var bodyData;
    if (arguments.length < 2 && isFunction(options)) {
      options = { commit: true }; // 'commit:true' option is default
    }
    // We need JSON response
    options.wt = "json";
    bodyData = {
      add: {
        doc: null,
        overwrite: true,
      },
    };

    return this._requestPost(
      this.UPDATE_EXTRACT_PATH,
      JSON.stringify(bodyData),
      options
    );
  }
  /**
   * Delete
   *
   * @param {String|Object} query - query
   * @param {Object|Function} [options] - delete options
   *
   * @returns {Promise} - it returns a Promise
   */
  delete(query, options) {
    var bodyData, bodyQuery;
    if (arguments.length < 3 && isFunction(options)) {
      options = { commit: true }; // 'commit:true' option is default
    }

    if (isString(query)) {
      bodyQuery = query;
    } else if (isObject(query)) {
      bodyQuery = stringify(query, " AND ", ":");
    } else {
      bodyQuery = "";
    }

    bodyData = {
      delete: {
        query: bodyQuery,
      },
    };

    return this._requestPost(
      this.UPDATE_PATH,
      JSON.stringify(bodyData),
      options
    );
  }
  /**
   * Ping
   *
   *
   * @returns {Promise} - it returns a Promise
   */
  ping() {
    return this._requestGet(this.PING_PATH, "");
  }
  /**
   * Commit
   *
   *
   * @returns {Promise} - it returns a Promise
   */
  commit() {
    return this._requestPost(this.UPDATE_PATH, JSON.stringify({}), {
      commit: true,
    });
  }
  /**
   * SoftCommit
   *
   *
   * @returns {Promise} - it returns a Promise
   */
  softCommit() {
    return this._requestPost(this.UPDATE_PATH, JSON.stringify({}), {
      softCommit: true,
    });
  }
  /**
   * Suggest Component
   *
   * @param {Object} query
   *
   * @returns {Promise} - it returns a Promise
   */
  suggest(query) {
    return this._requestGet(this.SUGGEST_PATH, query);
  }
}

export default Client;
