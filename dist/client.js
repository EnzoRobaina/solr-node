"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _underscore = require("underscore");
var _nodeFetch = _interopRequireDefault(require("node-fetch"));
var _log4jsApi = _interopRequireDefault(require("@log4js-node/log4js-api"));
var _querystring = require("querystring");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var logger = _log4jsApi["default"].getLogger("solr-node");
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
var Client = /*#__PURE__*/function () {
  function Client(options) {
    _classCallCheck(this, Client);
    _defineProperty(this, "_queryToObj", function (query) {
      console.log("queryToObj", query);
      return query;
    });
    this.options = {
      host: options.host || "127.0.0.1",
      port: options.port || "",
      core: options.core || "",
      rootPath: options.rootPath || "solr",
      protocol: options.protocol || "http"
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
  _createClass(Client, [{
    key: "_makeHostUrl",
    value: function _makeHostUrl(protocol, host, port, user, password) {
      var auth = "";
      if (user && password) {
        auth = encodeURIComponent(user) + ":" + encodeURIComponent(password) + "@";
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
  }, {
    key: "_callSolrServer",
    value: function _callSolrServer(requestFullPath, fetchOptions) {
      return (0, _nodeFetch["default"])(requestFullPath, fetchOptions).then(function (res) {
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
  }, {
    key: "_requestGet",
    value: function _requestGet(path, query) {
      var headers = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {
        accept: "application/json; charset=utf-8"
      };
      var options, requestPrefixUrl, requestFullPath;
      var params = new URLSearchParams(query);
      requestPrefixUrl = this._makeHostUrl(this.options.protocol, this.options.host, this.options.port, this.options.user, this.options.password);
      requestPrefixUrl += "/" + [this.options.rootPath, this.options.core, path].join("/");
      requestFullPath = requestPrefixUrl + "?" + params.toString();
      logger.debug("[_requestGet] requestFullPath: ", requestFullPath);
      options = {
        method: "GET",
        headers: headers
      };
      console.log("doing get", {
        requestFullPath: requestFullPath,
        options: options,
        params: params.toString()
      });
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
  }, {
    key: "_requestPost",
    value: function _requestPost(path, data, urlOptions) {
      var headers = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {
        accept: "application/json; charset=utf-8",
        "content-type": "application/json; charset=utf-8"
      };
      var options, requestPrefixUrl, requestFullPath;
      var params = new URLSearchParams(urlOptions);
      requestPrefixUrl = this._makeHostUrl(this.options.protocol, this.options.host, this.options.port, this.options.user, this.options.password);
      requestPrefixUrl += "/" + [this.options.rootPath, this.options.core, path].join("/");
      requestFullPath = requestPrefixUrl + "?" + params.toString();
      logger.debug("[_requestPost] requestFullPath: ", requestFullPath);
      logger.debug("[_requestPost] data: ", data);
      options = {
        method: "POST",
        body: data,
        headers: headers
      };
      console.log("doing post", {
        requestFullPath: requestFullPath,
        options: options,
        params: params.toString()
      });
      return this._callSolrServer(requestFullPath, options);
    }
    /**
     * Stream
     *
     * @param {Object} query
     *
     * @returns {Promise} - it returns a Promise
     */
  }, {
    key: "stream",
    value: function stream(query) {
      var trimEof = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      var method = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "GET";
      return (method === "GET" ? this._requestGet(this.STREAM_PATH, query) : this._requestPost(this.STREAM_PATH, new URLSearchParams(query), {}, {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
      })).then(function (response) {
        var result = response["result-set"];
        if (!result || !result.docs || !result.docs.length) {
          throw new Error("No result-set/docs in response");
        }
        var error = result.docs[result.docs.length - 1]["EXCEPTION"];
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
  }, {
    key: "search",
    value: function search(query) {
      var method = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "GET";
      return method === "GET" ? this._requestGet(this.SEARCH_PATH, query) : this._requestPost(this.SEARCH_PATH, JSON.stringify({
        params: this._queryToObj(query)
      }), "");
    }
    /**
     * Terms
     *
     * @param {Object} query
     *
     * @returns {Promise} - it returns a Promise
     */
  }, {
    key: "terms",
    value: function terms(query) {
      return this._requestGet(this.TERMS_PATH, query);
    }
    /**
     * Mlt
     *
     * @param {Object} query
     *
     * @returns {Promise} - it returns a Promise
     */
  }, {
    key: "mlt",
    value: function mlt(query) {
      return this._requestGet(this.MLT_PATH, query);
    }
    /**
     * Spell
     *
     * @param {Object} query
     *
     * @returns {Promise} - it returns a Promise
     */
  }, {
    key: "spell",
    value: function spell(query) {
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
  }, {
    key: "update",
    value: function update(data, options) {
      var bodyData;
      if (arguments.length < 3 && (0, _underscore.isFunction)(options)) {
        options = {
          commit: true
        }; // 'commit:true' option is default
      }

      bodyData = {
        add: {
          doc: data,
          overwrite: true
        }
      };
      return this._requestPost(this.UPDATE_PATH, JSON.stringify(bodyData), options);
    }
    /**
     * Update Extract (files to be indexed via Tika using stream.* param)
     *
     * @param {Object|Function} [options] - update options
     *
     * @returns {Promise} - it returns a Promise
     */
  }, {
    key: "updateExtract",
    value: function updateExtract(options) {
      var bodyData;
      if (arguments.length < 2 && (0, _underscore.isFunction)(options)) {
        options = {
          commit: true
        }; // 'commit:true' option is default
      }
      // We need JSON response
      options.wt = "json";
      bodyData = {
        add: {
          doc: null,
          overwrite: true
        }
      };
      return this._requestPost(this.UPDATE_EXTRACT_PATH, JSON.stringify(bodyData), options);
    }
    /**
     * Delete
     *
     * @param {String|Object} query - query
     * @param {Object|Function} [options] - delete options
     *
     * @returns {Promise} - it returns a Promise
     */
  }, {
    key: "delete",
    value: function _delete(query, options) {
      var bodyData, bodyQuery;
      if (arguments.length < 3 && (0, _underscore.isFunction)(options)) {
        options = {
          commit: true
        }; // 'commit:true' option is default
      }

      if ((0, _underscore.isString)(query)) {
        bodyQuery = query;
      } else if ((0, _underscore.isObject)(query)) {
        bodyQuery = (0, _querystring.stringify)(query, " AND ", ":");
      } else {
        bodyQuery = "";
      }
      bodyData = {
        "delete": {
          query: bodyQuery
        }
      };
      return this._requestPost(this.UPDATE_PATH, JSON.stringify(bodyData), options);
    }
    /**
     * Ping
     *
     *
     * @returns {Promise} - it returns a Promise
     */
  }, {
    key: "ping",
    value: function ping() {
      return this._requestGet(this.PING_PATH, "");
    }
    /**
     * Commit
     *
     *
     * @returns {Promise} - it returns a Promise
     */
  }, {
    key: "commit",
    value: function commit() {
      return this._requestPost(this.UPDATE_PATH, JSON.stringify({}), {
        commit: true
      });
    }
    /**
     * SoftCommit
     *
     *
     * @returns {Promise} - it returns a Promise
     */
  }, {
    key: "softCommit",
    value: function softCommit() {
      return this._requestPost(this.UPDATE_PATH, JSON.stringify({}), {
        softCommit: true
      });
    }
    /**
     * Suggest Component
     *
     * @param {Object} query
     *
     * @returns {Promise} - it returns a Promise
     */
  }, {
    key: "suggest",
    value: function suggest(query) {
      return this._requestGet(this.SUGGEST_PATH, query);
    }
  }]);
  return Client;
}();
var _default = Client;
exports["default"] = _default;