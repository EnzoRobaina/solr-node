"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _underscore = require("underscore");
var _log4jsApi = _interopRequireDefault(require("@log4js-node/log4js-api"));
var _querystring = require("querystring");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var logger = _log4jsApi["default"].getLogger("solr-node");
/**
 * Solr Query
 *
 * @constructor
 */
var Query = /*#__PURE__*/function () {
  function Query() {
    _classCallCheck(this, Query);
    this.params = [];
  }
  /**
   * Set DisMax query parser
   *
   * @return {Query}
   */
  _createClass(Query, [{
    key: "dismax",
    value: function dismax() {
      var self = this;
      self.params.unshift("defType=dismax");
      return self;
    }
    /**
     * Set eDisMax query parser
     *
     * @return {Query}
     */
  }, {
    key: "edismax",
    value: function edismax() {
      var self = this;
      self.params.unshift("defType=edismax");
      return self;
    }
    /**
     * Set query params
     *
     * @param {Object|String} params - query object or query string
     * @param {String} [params.str] - native str query ( ex) '(name:test OR category:test)' )
     *
     * @returns {Query}
     */
  }, {
    key: "q",
    value: function q(params) {
      var self = this;
      var queryPrefix = "q=";
      var qString = null;
      var strParam = null;
      if ((0, _underscore.isObject)(params) && !(0, _underscore.isEmpty)(params)) {
        strParam = "";
        if (!(0, _underscore.isUndefined)(params.str)) {
          strParam = (0, _underscore.allKeys)(params).length > 1 ? "%20AND%20" + encodeURIComponent(params.str) : encodeURIComponent(params.str);
          delete params.str;
        }
        qString = queryPrefix + (0, _querystring.stringify)(params, "%20AND%20", ":") + strParam;
      } else if ((0, _underscore.isString)(params)) {
        qString = queryPrefix + encodeURIComponent(params);
      } else {
        qString = queryPrefix + "*:*";
      }
      self.params.push(qString);
      logger.debug("[q] params: ", self.params);
      return self;
    }
    /**
     *  Set default query operator
     *
     * @param {String} params - default operator('AND'|'OR')
     *
     * @return  {Query}
     */
  }, {
    key: "qop",
    value: function qop(params) {
      var self = this;
      self.params.push("q.op=" + params);
      return self;
    }
    /**
     * Set field params
     *
     * @param {String|String[]} params - field name
     *
     * @returns {Query}
     */
  }, {
    key: "fl",
    value: function fl(params) {
      var self = this;
      var flPrefix = "fl=";
      if ((0, _underscore.isString)(params)) {
        self.params.push(flPrefix + params);
      } else if ((0, _underscore.isArray)(params)) {
        self.params.push(flPrefix + params.join(","));
      }
      logger.debug("[fl] params: ", self.params);
      return self;
    }
    /**
     * Set start params
     *
     * @param {Number} params - offset number
     *
     * @returns {Query}
     */
  }, {
    key: "start",
    value: function start(params) {
      var self = this;
      self.params.push("start=" + params);
      return self;
    }
    /**
     * Set rows params
     *
     * @param {Number} params - size number
     *
     * @returns {Query}
     */
  }, {
    key: "rows",
    value: function rows(params) {
      var self = this;
      self.params.push("rows=" + params);
      return self;
    }
    /**
     * Set sort params
     *
     * @param {Object} params - sort options
     *
     * @return {Query}
     */
  }, {
    key: "sort",
    value: function sort(params) {
      var self = this;
      self.params.push("sort=" + (0, _querystring.stringify)(params, ",", "%20"));
      return self;
    }
    /**
     * Get Fq String
     *
     * @param {Object} param
     * @param {String} [param.field] - fq field
     * @param {String} param.value - fq value
     *
     * @returns {String}
     * @private
     */
  }, {
    key: "_getFqStr",
    value: function _getFqStr(param) {
      var fqStr = "";
      if (!(0, _underscore.isUndefined)(param.field)) {
        fqStr += param.field + ":";
      }
      fqStr += param.value;
      return "fq=" + encodeURIComponent(fqStr);
    }
    /**
     * Set filter query params
     *
     * @param {Object|Object[]} params - filter options
     * @param {String} [params.field] - filter field
     * @param {String|Number} [params.value] - filter value
     *
     * @return {Query}
     */
  }, {
    key: "fq",
    value: function fq(params) {
      var self = this;
      var i, len;
      if ((0, _underscore.isArray)(params)) {
        // When params is Array
        for (i = 0, len = params.length; i < len; i++) {
          self.params.push(self._getFqStr(params[i]));
        }
      } else if ((0, _underscore.isObject)(params)) {
        // When params is Object
        self.params.push(self._getFqStr(params));
      }
      logger.debug("[fq] params: ", self.params);
      return self;
    }
    /**
     * Set the default query field.
     *
     * @param {String} params - default field for search
     *
     * @return  {Query}
     */
  }, {
    key: "df",
    value: function df(params) {
      var self = this;
      self.params.push("df=" + params);
      return self;
    }
    /**
     * Set the response type.
     *
     * @param {String} params - response type (json|xml)
     *
     * @return  {Query}
     */
  }, {
    key: "wt",
    value: function wt(params) {
      var self = this;
      self.params.push("wt=" + params);
      return self;
    }
    /**
     * Add params
     *
     * @param {Object[]} params
     * @param {String} params.field - params field
     * @param {String} params.value - params value
     *
     * @returns {Query}
     */
  }, {
    key: "addParams",
    value: function addParams(params) {
      var self = this;
      var i, len;
      for (i = 0, len = params.length; i < len; i++) {
        self.params.push(params[i].field + "=" + encodeURIComponent(params[i].value));
      }
      return self;
    }
    /**
     * Spatial
     *
     * @param {Object} params
     * @param {String} params.pt - params pt
     * @param {String} params.sfield - params sfield
     * @param {String|Number} params.d - params d
     *
     * @returns {Query}
     */
  }, {
    key: "spatial",
    value: function spatial(params) {
      var self = this;
      if ((0, _underscore.isObject)(params) && !(0, _underscore.isEmpty)(params)) {
        if (params.on === false) {
          self.params.push("spatial=false");
        } else {
          self.params.push("spatial=true");
        }
        if (!(0, _underscore.isUndefined)(params.pt)) {
          self.params.push("pt=" + params.pt);
        }
        if (!(0, _underscore.isUndefined)(params.sfield)) {
          self.params.push("sfield=" + params.sfield);
        }
        if (!(0, _underscore.isUndefined)(params.d)) {
          self.params.push("d=" + params.d);
        }
      } else {
        throw new Error("spatial params must be an object");
      }
      return self;
    }
    /**
     * Set terms query params
     *
     * @param {Object|String} params - terms object or terms string
     * @param {Boolean} [params.on=true] - Turn on or off terms
     * @param {String} params.fl - The name of the field to get the terms from.
     * @param {String} [params.lower] - The term to start at. If not specified, the empty string is used, meaning start at the beginning of the field.
     * @param {Boolean} [params.lowerIncl] - The term to start at. Include the lower bound term in the result set. Default is true.
     * @param {Number} [params.mincount] - The minimum doc frequency to return in order to be included.
     * @param {Number} [params.maxcount] - The maximum doc frequency.
     * @param {String} [params.prefix] - Restrict matches to terms that start with the prefix.
     * @param {String} [params.regex] - Restrict matches to terms that match the regular expression.
     * @param {String} [params.regexFlag] - Flags to be used when evaluating the regular expression defined in the "terms.regex" parameter.(case_insensitive|comments|multiline|literal|dotall|unicode_case|canon_eq|unix_lines)
     * @param {Number} [params.limit] - The maximum number of terms to return.
     * @param {String} [params.upper] - The term to stop at. Either upper or terms.limit must be set.
     * @param {Boolean} [params.upperIncl] - Include the upper bound term in the result set. Default is false.
     * @param {Boolean} [params.raw] - If true, return the raw characters of the indexed term, regardless of if it is human readable.
     * @param {String} [params.sort] - If count, sorts the terms by the term frequency (highest count first). If index, returns the terms in index order.(count|index)
     *
     * @returns {Query}
     */
  }, {
    key: "termsQuery",
    value: function termsQuery(params) {
      var self = this;
      if (!(0, _underscore.isString)(params) && !(0, _underscore.isObject)(params)) {
        return self;
      }
      if ((0, _underscore.isString)(params)) {
        self.params.push(params);
        return self;
      }
      if (params.on === false) {
        self.params.push("terms=false");
      } else {
        self.params.push("terms=true");
      }
      if (!(0, _underscore.isUndefined)(params.fl)) {
        self.params.push("terms.fl=" + params.fl);
      }
      if (!(0, _underscore.isUndefined)(params.lower)) {
        self.params.push("terms.lower=" + params.lower);
      }
      if (!(0, _underscore.isUndefined)(params.lowerIncl)) {
        self.params.push("terms.lower.incl=" + params.lowerIncl);
      }
      if (!(0, _underscore.isUndefined)(params.mincount)) {
        self.params.push("terms.mincount=" + params.mincount);
      }
      if (!(0, _underscore.isUndefined)(params.maxcount)) {
        self.params.push("terms.maxcount=" + params.maxcount);
      }
      if (!(0, _underscore.isUndefined)(params.prefix)) {
        self.params.push("terms.prefix=" + encodeURIComponent(params.prefix));
      }
      if (!(0, _underscore.isUndefined)(params.regex)) {
        self.params.push("terms.regex=" + params.regex);
      }
      if (!(0, _underscore.isUndefined)(params.regexFlag)) {
        self.params.push("terms.regexFlag=" + params.regexFlag);
      }
      if (!(0, _underscore.isUndefined)(params.limit)) {
        self.params.push("terms.limit=" + params.limit);
      }
      if (!(0, _underscore.isUndefined)(params.upper)) {
        self.params.push("terms.upper=" + params.upper);
      }
      if (!(0, _underscore.isUndefined)(params.upperIncl)) {
        self.params.push("terms.upper.incl=" + params.upperIncl);
      }
      if (!(0, _underscore.isUndefined)(params.raw)) {
        self.params.push("terms.raw=" + params.raw);
      }
      if (!(0, _underscore.isUndefined)(params.sort)) {
        self.params.push("terms.sort=" + params.sort);
      }
      logger.debug("[termsQuery] params: ", self.params);
      return self;
    }
    /**
     * Set mlt query params
     *
     * @param {Object|String} params - mlt object or mlt string
     * @param {Boolean} [params.on=true] - Turn on or off mlt
     * @param {String|Array} [params.fl] - Specifies the fields to use for similarity. If possible, these should have stored termVectors.
     * @param {Number} [params.mintf] - Specifies the Minimum Term Frequency, the frequency below which terms will be ignored in the source document.
     * @param {Number} [params.mindf] - Specifies the Minimum Document Frequency, the frequency at which words will be ignored which do not occur in at least this many documents.
     * @param {Number} [params.maxdf] - Specifies the Maximum Document Frequency, the frequency at which words will be ignored which occur in more than this many documents.
     * @param {Number} [params.minwl] - Sets the minimum word length below which words will be ignored.
     * @param {Number} [params.maxwl] - Sets the maximum word length above which words will be ignored.
     * @param {Number} [params.maxqt] - Sets the maximum number of query terms that will be included in any generated query.
     * @param {Number} [params.maxntp] - Sets the maximum number of tokens to parse in each example document field that is not stored with TermVector support.
     * @param {Boolean} [params.boost] - Specifies if the query will be boosted by the interesting term relevance. It can be either "true" or "false".
     * @param {String} [params.qf] - Query fields and their boosts using the same format as that used by the DisMaxRequestHandler. These fields must also be specified in mlt.fl.
     * @param {Number} [params.count] - Specifies the number of similar documents to be returned for each result. The default value is 5.
     * @param {Boolean} [params.matchInclude] - Specifies whether or not the response should include the matched document. If set to false, the response will look like a normal select response.
     * @param {Number} [params.matchOffset] - Specifies an offset into the main query search results to locate the document on which the MoreLikeThis query should operate. By default, the query operates on the first result for the q parameter.
     * @param {String} [params.interestingTerms] - Controls how the MoreLikeThis component presents the "interesting" terms (the top TF/IDF terms) for the query. ("list"|"details"|"none")
     *
     * @returns {Query}
     */
  }, {
    key: "mltQuery",
    value: function mltQuery(params) {
      var self = this;
      if (!(0, _underscore.isString)(params) && !(0, _underscore.isObject)(params)) {
        return self;
      }
      if ((0, _underscore.isString)(params)) {
        self.params.push(params);
        return self;
      }
      if (params.on === false) {
        self.params.push("mlt=false");
      } else {
        self.params.push("mlt=true");
      }
      if (!(0, _underscore.isUndefined)(params.fl)) {
        if ((0, _underscore.isArray)(params.fl)) {
          params.fl = params.fl.join(",");
        }
        self.params.push("mlt.fl=" + params.fl);
      }
      if (!(0, _underscore.isUndefined)(params.mintf)) {
        self.params.push("mlt.mintf=" + params.mintf);
      }
      if (!(0, _underscore.isUndefined)(params.mindf)) {
        self.params.push("mlt.mindf=" + params.mindf);
      }
      if (!(0, _underscore.isUndefined)(params.maxdf)) {
        self.params.push("mlt.maxdf=" + params.maxdf);
      }
      if (!(0, _underscore.isUndefined)(params.minwl)) {
        self.params.push("mlt.minwl=" + params.minwl);
      }
      if (!(0, _underscore.isUndefined)(params.maxwl)) {
        self.params.push("mlt.maxwl=" + params.maxwl);
      }
      if (!(0, _underscore.isUndefined)(params.maxqt)) {
        self.params.push("mlt.maxqt=" + params.maxqt);
      }
      if (!(0, _underscore.isUndefined)(params.maxntp)) {
        self.params.push("mlt.maxntp=" + params.maxntp);
      }
      if (!(0, _underscore.isUndefined)(params.boost)) {
        self.params.push("mlt.boost=" + params.boost);
      }
      if (!(0, _underscore.isUndefined)(params.qf)) {
        self.params.push("mlt.qf=" + params.qf);
      }
      if (!(0, _underscore.isUndefined)(params.count)) {
        self.params.push("mlt.count=" + params.count);
      }
      if (!(0, _underscore.isUndefined)(params.matchInclude)) {
        self.params.push("mlt.match.include=" + params.matchInclude);
      }
      if (!(0, _underscore.isUndefined)(params.matchOffset)) {
        self.params.push("mlt.match.offset=" + params.matchOffset);
      }
      if (!(0, _underscore.isUndefined)(params.interestingTerms)) {
        self.params.push("mlt.interestingTerms=" + params.interestingTerms);
      }
      logger.debug("[mltQuery] params: ", self.params);
      return self;
    }
    /**
     * Set spellcheck query params
     *
     * @param {Object|String} params - spell object or spell string
     * @param {Boolean} [params.on=true] - Turn on or off spell
     * @param {String} [params.q] - Selects the query to be spellchecked.
     * @param {Boolean} [params.build] - Instructs Solr to build a dictionary for use in spellchecking.
     * @param {Boolean} [params.collate] - Causes Solr to build a new query based on the best suggestion for each term in the submitted query.
     * @param {Number} [params.maxCollations] - This parameter specifies the maximum number of collations to return.
     * @param {Number} [params.maxCollationTries] - This parameter specifies the number of collation possibilities for Solr to try before giving up.
     * @param {Number} [params.maxCollationEvaluations] - This parameter specifies the maximum number of word correction combinations to rank and evaluate prior to deciding which collation candidates to test against the index.
     * @param {Boolean} [params.collateExtendedResults] - If true, returns an expanded response detailing the collations found. If s pellcheck.collate is false, this parameter will be ignored.
     * @param {Number} [params.collateMaxCollectDocs] - The maximum number of documents to collect when testing potential Collations
     * @param {Number} [params.count] - Specifies the maximum number of spelling suggestions to be returned.
     * @param {String} [params.dictionary] - Specifies the dictionary that should be used for spellchecking.
     * @param {Boolean} [params.extendedResults] - Causes Solr to return additional information about spellcheck results, such as the frequency of each original term in the index (origFreq) as well as the frequency of each suggestion in the index (frequency).
     * @param {Boolean} [params.onlyMorePopular] - Limits spellcheck responses to queries that are more popular than the original query.
     * @param {Number} [params.maxResultsForSuggest] - The maximum number of hits the request can return in order to both generate spelling suggestions and set the "correctlySpelled" element to "false".
     * @param {Number} [params.alternativeTermCount] - The count of suggestions to return for each query term existing in the index and/or dictionary.
     * @param {Boolean} [params.reload] - Reloads the spellchecker.
     * @param {Number} [params.accuracy] - Specifies an accuracy value to help decide whether a result is worthwhile. The value is a float between 0 and 1.
     *
     * @returns {Query}
     */
  }, {
    key: "spellcheckQuery",
    value: function spellcheckQuery(params) {
      var self = this;
      if (!(0, _underscore.isString)(params) && !(0, _underscore.isObject)(params)) {
        return self;
      }
      if ((0, _underscore.isString)(params)) {
        self.params.push(params);
        return self;
      }
      if (params.on === false) {
        self.params.push("spellcheck=false");
      } else {
        self.params.push("spellcheck=true");
      }
      if (!(0, _underscore.isUndefined)(params.q)) {
        self.params.push("spellcheck.q=" + encodeURIComponent(params.q));
      }
      if (!(0, _underscore.isUndefined)(params.build)) {
        self.params.push("spellcheck.build=" + params.build);
      }
      if (!(0, _underscore.isUndefined)(params.collate)) {
        self.params.push("spellcheck.collate=" + params.collate);
      }
      if (!(0, _underscore.isUndefined)(params.maxCollations)) {
        self.params.push("spellcheck.maxCollations=" + params.maxCollations);
      }
      if (!(0, _underscore.isUndefined)(params.maxCollationTries)) {
        self.params.push("spellcheck.maxCollationTries=" + params.maxCollationTries);
      }
      if (!(0, _underscore.isUndefined)(params.maxCollationEvaluations)) {
        self.params.push("spellcheck.maxCollationEvaluations=" + params.maxCollationEvaluations);
      }
      if (!(0, _underscore.isUndefined)(params.collateExtendedResults)) {
        self.params.push("spellcheck.collateExtendedResults=" + params.collateExtendedResults);
      }
      if (!(0, _underscore.isUndefined)(params.collateMaxCollectDocs)) {
        self.params.push("spellcheck.collateMaxCollectDocs=" + params.collateMaxCollectDocs);
      }
      if (!(0, _underscore.isUndefined)(params.count)) {
        self.params.push("spellcheck.count=" + params.count);
      }
      if (!(0, _underscore.isUndefined)(params.dictionary)) {
        self.params.push("spellcheck.dictionary=" + params.dictionary);
      }
      if (!(0, _underscore.isUndefined)(params.extendedResults)) {
        self.params.push("spellcheck.extendedResults=" + params.extendedResults);
      }
      if (!(0, _underscore.isUndefined)(params.onlyMorePopular)) {
        self.params.push("spellcheck.onlyMorePopular=" + params.onlyMorePopular);
      }
      if (!(0, _underscore.isUndefined)(params.maxResultsForSuggest)) {
        self.params.push("spellcheck.maxResultsForSuggest=" + params.maxResultsForSuggest);
      }
      if (!(0, _underscore.isUndefined)(params.alternativeTermCount)) {
        self.params.push("spellcheck.alternativeTermCount=" + params.alternativeTermCount);
      }
      if (!(0, _underscore.isUndefined)(params.reload)) {
        self.params.push("spellcheck.reload=" + params.reload);
      }
      if (!(0, _underscore.isUndefined)(params.accuracy)) {
        self.params.push("spellcheck.accuracy=" + params.accuracy);
      }
      logger.debug("[spellcheckQuery] params: ", self.params);
      return self;
    }
    /**
     * Set suggest query params
     *
     * @param {Object|String} params - spell object or spell string
     * @param {Boolean} [params.on=true] - Turn on or off suggest
     * @param {String} [params.q] - Selects the query to be suggest.
     * @param {Boolean} [params.build] - Instructs Solr to build a dictionary for use in suggesting.
     * @param {Number} [params.count] - Specifies the maximum number of suggestions to be returned.
     * @param {String} [params.suggesterClass] - Specifies the dictionary that should be used for suggestions.
     *
     * @returns {Query}
     */
  }, {
    key: "suggestQuery",
    value: function suggestQuery(params) {
      var self = this;
      if (!(0, _underscore.isString)(params) && !(0, _underscore.isObject)(params)) {
        return self;
      }
      if ((0, _underscore.isString)(params)) {
        self.params.push(params);
        return self;
      }
      if (params.on === false) {
        self.params.push("suggest=false");
      } else {
        self.params.push("suggest=true");
      }
      if (!(0, _underscore.isUndefined)(params.q)) {
        self.params.push("suggest.q=" + encodeURIComponent(params.q));
      }
      if (!(0, _underscore.isUndefined)(params.build)) {
        self.params.push("suggest.build=" + params.build);
      }
      if (!(0, _underscore.isUndefined)(params.count)) {
        self.params.push("suggest.count=" + params.count);
      }
      if (!(0, _underscore.isUndefined)(params.dictionary)) {
        self.params.push("suggest.dictionary=" + params.dictionary);
      }
      logger.debug("[suggestQuery] params: ", self.params);
      return self;
    }
    /**
     * Set facet query params
     *
     * @param {Object|String} params - facet object or facet string
     * @param {Boolean} [params.on=true] - Turn on or off facet
     * @param {String} [params.query] - Specifies a Lucene query to generate a facet count.
     * @param {String|Array} [params.field] - Identifies a field to be treated as a facet.
     * @param {String} [params.prefix] - Limits the terms used for faceting to those that begin with the specified prefix.
     * @param {String} [params.contains] - Limits the terms used for faceting to those that contain the specified substring.
     * @param {String} [params.containsIgnoreCase] - If facet.contains is used, ignore case when searching for the specified substring.
     * @param {String} [params.sort] - Controls how faceted results are sorted. (count|index)
     * @param {Number} [params.limit] - Controls how many constraints should be returned for each facet.
     * @param {Number} [params.offset] - Specifies an offset into the facet results at which to begin displaying facets.
     * @param {Number} [params.mincount] - Specifies the minimum counts required for a facet field to be included in the response.
     * @param {Boolean} [params.missing] - Controls whether Solr should compute a count of all matching results which have no value for the field, in addition to the term-based constraints of a facet field.
     * @param {String} [params.method] - Selects the algorithm or method Solr should use when faceting a field. (enum|fc|fcs)
     *
     * @returns {Query}
     */
  }, {
    key: "facetQuery",
    value: function facetQuery(params) {
      var self = this;
      if (!(0, _underscore.isString)(params) && !(0, _underscore.isObject)(params)) {
        return self;
      }
      if ((0, _underscore.isString)(params)) {
        self.params.push(params);
        return self;
      }
      if (params.on === false) {
        self.params.push("facet=false");
      } else {
        self.params.push("facet=true");
      }
      if (!(0, _underscore.isUndefined)(params.query)) {
        self.params.push("facet.query=" + params.query);
      }
      if (!(0, _underscore.isUndefined)(params.field)) {
        if ((0, _underscore.isArray)(params.field)) {
          params.field = params.field.join("&facet.field=");
        }
        self.params.push("facet.field=" + params.field);
      }
      if (!(0, _underscore.isUndefined)(params.prefix)) {
        self.params.push("facet.prefix=" + params.prefix);
      }
      if (!(0, _underscore.isUndefined)(params.contains)) {
        self.params.push("facet.contains=" + encodeURIComponent(params.contains));
      }
      if (!(0, _underscore.isUndefined)(params.containsIgnoreCase)) {
        self.params.push("facet.contains.ignoreCase=" + encodeURIComponent(params.containsIgnoreCase));
      }
      if (!(0, _underscore.isUndefined)(params.sort)) {
        self.params.push("facet.sort=" + params.sort);
      }
      if (!(0, _underscore.isUndefined)(params.limit)) {
        self.params.push("facet.limit=" + params.limit);
      }
      if (!(0, _underscore.isUndefined)(params.offset)) {
        self.params.push("facet.offset=" + params.offset);
      }
      if (!(0, _underscore.isUndefined)(params.mincount)) {
        self.params.push("facet.mincount=" + params.mincount);
      }
      if (!(0, _underscore.isUndefined)(params.missing)) {
        self.params.push("facet.missing=" + params.missing);
      }
      if (!(0, _underscore.isUndefined)(params.method)) {
        self.params.push("facet.method=" + params.method);
      }
      logger.debug("[facetQuery] params: ", self.params);
      return self;
    }
    /**
     * Set group query params
     *
     * @param {Object|String} params - group object or group string
     * @param {Boolean} [params.on=true] - Turn on or off group
     * @param {String} [params.field] - The name of the field by which to group results.
     * @param {String} [params.query] - Return a single group of documents that match the given query.
     * @param {Number} [params.limit] - Specifies the number of results to return for each group. The default value is 1.
     * @param {Number} [params.offset] - Specifies an initial offset for the document list of each group.
     * @param {String} [params.sort] - Specifies how Solr sorts documents within each group.
     * @param {String} [params.format] - If this parameter is set to simple, the grouped documents are presented in a single flat list, and the start and rows parameters affect the numbers of documents instead of groups.
     * @param {Boolean} [params.main] - If true, the result of the first field grouping command is used as the main result list in the response, using group.format=simple.
     * @param {Boolean} [params.ngroups] - If true, Solr includes the number of groups that have matched the query in the results. The default value is false.
     * @param {Boolean} [params.truncate] - If true, facet counts are based on the most relevant document of each group matching the query. The default value is false.
     * @param {Boolean} [params.facet] - Determines whether to compute grouped facets for the field facets specified in facet.field parameters.
     * @param {Number} [params.cachePercent] - Determines whether to compute grouped facets for the field facets specified in facet.field parameters.
     *
     * @returns {Query}
     */
  }, {
    key: "groupQuery",
    value: function groupQuery(params) {
      var self = this;
      if (!(0, _underscore.isString)(params) && !(0, _underscore.isObject)(params)) {
        return self;
      }
      if ((0, _underscore.isString)(params)) {
        self.params.push(params);
        return self;
      }
      if (params.on === false) {
        self.params.push("group=false");
      } else {
        self.params.push("group=true");
      }
      if (!(0, _underscore.isUndefined)(params.field)) {
        self.params.push("group.field=" + params.field);
      }
      if (!(0, _underscore.isUndefined)(params.query)) {
        self.params.push("group.query=" + params.query);
      }
      if (!(0, _underscore.isUndefined)(params.limit)) {
        self.params.push("group.limit=" + params.limit);
      }
      if (!(0, _underscore.isUndefined)(params.offset)) {
        self.params.push("group.offset=" + params.offset);
      }
      if (!(0, _underscore.isUndefined)(params.sort)) {
        self.params.push("group.sort=" + params.sort);
      }
      if (!(0, _underscore.isUndefined)(params.format)) {
        self.params.push("group.format=" + params.format);
      }
      if (!(0, _underscore.isUndefined)(params.main)) {
        self.params.push("group.main=" + params.main);
      }
      if (!(0, _underscore.isUndefined)(params.ngroups)) {
        self.params.push("group.ngroups=" + params.ngroups);
      }
      if (!(0, _underscore.isUndefined)(params.truncate)) {
        self.params.push("group.truncate=" + params.truncate);
      }
      if (!(0, _underscore.isUndefined)(params.facet)) {
        self.params.push("group.facet=" + params.facet);
      }
      if (!(0, _underscore.isUndefined)(params.cachePercent)) {
        self.params.push("group.cache.percent=" + params.cachePercent);
      }
      logger.debug("[groupQuery] params: ", self.params);
      return self;
    }
    /**
     * Set hl query params
     *
     * @param {Object|String} params - hl object or hl string
     * @param {Boolean} [params.on=true] - Turn on or off hl
     * @param {String} [params.method] - Specifies the highlighting implementation to use, acceptables values are unified, original, fastVector, and postings
     * @param {String} [params.q] - Specifies an overriding query term for highlighting
     * @param {String} [params.qparser] - Specifies a qparser to use for the hl.q query.
     * @param {String|Array} [params.fl] - Specifies a list of fields to highlight.
     * @param {Number} [params.snippets] - Specifies maximum number of highlighted snippets to generate per field.
     * @param {Number} [params.fragsize] - Specifies the size, in characters, of fragments to consider for highlighting.
     * @param {Boolean} [params.mergeContiguous] - Instructs Solr to collapse contiguous fragments into a single fragment.
     * @param {Boolean} [params.requireFieldMatch] - If set to true, highlights terms only if they appear in the specified field.
     * @param {Number} [params.maxAnalyzedChars] - Specifies the number of characters into a document that Solr should look for suitable snippets.
     * @param {Number} [params.maxMultiValuedToExamine] - Specifies the maximum number of entries in a multi-valued field to examine before stopping.
     * @param {Number} [params.maxMultiValuedToMatch] - Specifies the maximum number of matches in a multi-valued field that are found before stopping.
     * @param {String} [params.alternateField] - Specifies a field to be used as a backup default summary if Solr cannot generate a snippet (i.e., because no terms match).
     * @param {Number} [params.maxAlternateFieldLength] - Specifies the maximum number of characters of the field to return.
     * @param {String} [params.formatter=simple] - Selects a formatter for the highlighted output.
     * @param {String} [params.simplePre] - Specifies the text that should appear before. (<em>)
     * @param {String} [params.simplePost] - Specifies the text that should appear after. (</em>)
     * @param {String} [params.fragmenter] - Specifies a text snippet generator for highlighted text.
     * @param {Boolean} [params.usePhraseHighlighter] - If set to true, Solr will use the Lucene SpanScorer class to highlight phrase terms only when they appear within the query phrase in the document.
     * @param {Boolean} [params.highlightMultiTerm] - If set to true, Solr will use highlight phrase terms that appear in multi-term queries.
     * @param {Number} [params.regexSlop] - When using the regex fragmenter (hl.fragmenter =regex), this parameter defines the factor by which the fragmenter can stray from the ideal fragment size (given by hl.fragsize) to accommodate a regular expression.
     * @param {String} [params.regexPattern] - Specifies the regular expression for fragmenting. This could be used to extract sentences.
     * @param {Number} [params.regexMaxAnalyzedChars] - Instructs Solr to analyze only this many characters from a field when using the regex fragmenter (after which, the fragmenter produces fixed-sized fragments).
     * @param {Boolean} [params.preserveMulti] - If true, multi-valued fields will return all values in the order they were saved in the index. If false, only values that match the highlight request will be returned.
     *
     * @returns {Query}
     */
  }, {
    key: "hlQuery",
    value: function hlQuery(params) {
      var self = this;
      if (!(0, _underscore.isString)(params) && !(0, _underscore.isObject)(params)) {
        return self;
      }
      if ((0, _underscore.isString)(params)) {
        self.params.push(params);
        return self;
      }
      if (params.on === false) {
        self.params.push("hl=false");
      } else {
        self.params.push("hl=true");
      }
      if (!(0, _underscore.isUndefined)(params.method)) {
        self.params.push("hl.method=" + params.method);
      }
      if (!(0, _underscore.isUndefined)(params.q)) {
        self.params.push("hl.q=" + params.q);
      }
      if (!(0, _underscore.isUndefined)(params.qparser)) {
        self.params.push("hl.qparser=" + params.qparser);
      }
      if (!(0, _underscore.isUndefined)(params.fl)) {
        if ((0, _underscore.isArray)(params.fl)) {
          params.fl = params.fl.join(",");
        }
        self.params.push("hl.fl=" + params.fl);
      }
      if (!(0, _underscore.isUndefined)(params.snippets)) {
        self.params.push("hl.snippets=" + params.snippets);
      }
      if (!(0, _underscore.isUndefined)(params.fragsize)) {
        self.params.push("hl.fragsize=" + params.fragsize);
      }
      if (!(0, _underscore.isUndefined)(params.mergeContiguous)) {
        self.params.push("hl.mergeContiguous=" + params.mergeContiguous);
      }
      if (!(0, _underscore.isUndefined)(params.requireFieldMatch)) {
        self.params.push("hl.requireFieldMatch=" + params.requireFieldMatch);
      }
      if (!(0, _underscore.isUndefined)(params.maxAnalyzedChars)) {
        self.params.push("hl.maxAnalyzedChars=" + params.maxAnalyzedChars);
      }
      if (!(0, _underscore.isUndefined)(params.maxMultiValuedToExamine)) {
        self.params.push("hl.maxMultiValuedToExamine=" + params.maxMultiValuedToExamine);
      }
      if (!(0, _underscore.isUndefined)(params.maxMultiValuedToMatch)) {
        self.params.push("hl.maxMultiValuedToMatch=" + params.maxMultiValuedToMatch);
      }
      if (!(0, _underscore.isUndefined)(params.alternateField)) {
        self.params.push("hl.alternateField=" + params.alternateField);
      }
      if (!(0, _underscore.isUndefined)(params.maxAlternateFieldLength)) {
        self.params.push("hl.maxAlternateFieldLength=" + params.maxAlternateFieldLength);
      }
      if (!(0, _underscore.isUndefined)(params.formatter)) {
        self.params.push("hl.formatter=" + params.formatter);
      }
      if (!(0, _underscore.isUndefined)(params.simplePre)) {
        self.params.push("hl.simple.pre=" + params.simplePre);
      }
      if (!(0, _underscore.isUndefined)(params.simplePost)) {
        self.params.push("hl.simple.post=" + params.simplePost);
      }
      if (!(0, _underscore.isUndefined)(params.fragmenter)) {
        self.params.push("hl.fragmenter=" + params.fragmenter);
      }
      if (!(0, _underscore.isUndefined)(params.usePhraseHighlighter)) {
        self.params.push("hl.usePhraseHighlighter=" + params.usePhraseHighlighter);
      }
      if (!(0, _underscore.isUndefined)(params.highlightMultiTerm)) {
        self.params.push("hl.highlightMultiTerm=" + params.highlightMultiTerm);
      }
      if (!(0, _underscore.isUndefined)(params.regexSlop)) {
        self.params.push("hl.regex.slop=" + params.regexSlop);
      }
      if (!(0, _underscore.isUndefined)(params.regexPattern)) {
        self.params.push("hl.regex.pattern=" + params.regexPattern);
      }
      if (!(0, _underscore.isUndefined)(params.regexMaxAnalyzedChars)) {
        self.params.push("hl.regex.maxAnalyzedChars=" + params.regexMaxAnalyzedChars);
      }
      if (!(0, _underscore.isUndefined)(params.preserveMulti)) {
        self.params.push("hl.preserveMulti=" + params.preserveMulti);
      }
      logger.debug("[hlQuery] params: ", self.params);
      return self;
    }
    /**
     * Make query to string
     *
     * @returns {String}
     */
  }, {
    key: "toString",
    value: function toString() {
      var self = this;
      var resultString;
      logger.debug("[toString] params: ", self.params);
      resultString = self.params.join("&");
      if (resultString.indexOf("wt=") === -1) {
        // When 'wt=' not exist
        resultString += "&wt=json";
      }
      return resultString;
    }
  }]);
  return Query;
}();
var _default = Query;
exports["default"] = _default;