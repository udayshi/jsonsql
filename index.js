'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Access JSON via sql like syntax.
 *
 * @author Uday Shiwakoti < shiuday@gmail.com
 * @date 2018/05/15
 */
var JSONSql = function () {
    _createClass(JSONSql, [{
        key: 'reset',

        /**
         * reset the instance.
         */
        value: function reset() {
            this._data = [];
            this._columns = [];
            this._pickcol = [];
            this._aggcol = [];
            this._where = [];
            this._order = [];
            this._having = [];
            this._must_fields = new Set();
        }
    }]);

    function JSONSql() {
        _classCallCheck(this, JSONSql);

        this.reset();
    }

    /**
     * Parse the field.
     * @param field
     * @returns {{method: string, field_name: string, alias_name: string}}
     */

    _createClass(JSONSql, [{
        key: 'getField',
        value: function getField(field) {
            field = field.trim();
            var method_alias_regx = field.match(/^(\w+)\((.{1,})\) as (\w+)/i);
            var method_regx = field.match(/^(\w+)\((.{1,})\)/i);
            var alias_regex = field.match(/^(\w+) as (.{1,})/i);
            var output = { method: '', field_name: '', alias_name: '' };
            if (method_alias_regx !== null) {
                output.method = method_alias_regx[1].toLowerCase();
                output.field_name = method_alias_regx[2];
                output.alias_name = method_alias_regx[3];
            } else if (method_regx !== null) {
                output.method = method_regx[1].toLowerCase();
                output.field_name = method_regx[2];
                output.alias_name = output.method + '_' + method_regx[2];
            } else if (alias_regex !== null) {
                output.field_name = alias_regex[1];
                output.alias_name = alias_regex[2];
            } else {
                output.field_name = field;
                output.alias_name = field;
            }

            return output;
        }

        /**
         * Providing the fields which we want to select
         * @param fields
         * @returns {USUtil}
         */

    }, {
        key: 'select',
        value: function select(fields) {
            var _this = this;

            this.reset();
            if (fields == '*') this._columns = '*';else {

                this._columns = fields.split(',').map(function (field) {
                    return _this.getField(field);
                });
            }

            return this;
        }

        /**
         * Providing the json dataset
         * @param data
         * @returns {USUtil}
         */

    }, {
        key: 'from',
        value: function from(data) {
            this._data = data;
            return this;
        }

        /**
         * Providing the condition for the given sets
         *
         * @param k
         * @param oper
         * @param v
         * @returns {USUtil}
         */

    }, {
        key: 'where',
        value: function where(k, oper, v) {
            this._where.push({ field_name: k, oper: oper, v: v });

            return this;
        }

        /**
         * Providing the condition for the given sets
         *
         * @param k
         * @param oper
         * @param v
         * @returns {USUtil}
         */

    }, {
        key: 'having',
        value: function having(k, oper, v) {
            this._having.push({ field_name: k, oper: oper, v: v });

            return this;
        }

        /**
         * Ordering the filtered dataset
         * @param field
         * @returns {USUtil}
         */

    }, {
        key: 'orderby',
        value: function orderby(field) {
            var _this2 = this;

            var order = field.split(',');
            order.forEach(function (r) {
                var tmp = r.split(' ');
                var type = typeof tmp[1] == 'undefined' ? 'asc' : tmp[1].toLowerCase().trim();

                if (type != 'asc' && type != 'desc') type = 'asc';

                _this2._order.push({ k: tmp[0].trim(), direction: type });
            });

            return this;
        }

        /**
         * ordering the dataset
         * @returns this
         * @private
         */

    }, {
        key: '_setOrderBy',
        value: function _setOrderBy() {
            var _this3 = this;

            var data = this._data;
            if (this._order.length > 0) {
                data = data.sort(function (r_a, r_b) {

                    for (var i = 0; i < _this3._order.length; i++) {
                        var order = _this3._order[i];
                        var or_a = r_a[order.k];
                        var or_b = r_b[order.k];
                        if (or_a == '') or_a = '';
                        if (or_b == '') or_b = '';
                        if (or_a > 0) {
                            //int
                        } else {
                            or_a = or_a.toString().toLowerCase();
                            or_b = or_b.toString().toLowerCase();
                        }
                        if (order.direction == 'desc') {
                            return or_a < or_b;
                        } else {
                            return or_a > or_b;
                        }
                    }
                });
            }
            this._data = data;
            // console.log('Order By : ',this.data,'\n-----------------')
            return this;
        }

        /**
         * Filter the dataset based on where condition.
         * @returns void
         * @private
         */

    }, {
        key: '_setFilterData',
        value: function _setFilterData() {
            var _this4 = this;

            var output = this._data;

            if (this._where.length > 0) {
                output = output.filter(function (row) {
                    var total_found = 0;
                    _this4._where.forEach(function (cond) {
                        var cv = cond.v;

                        var rv = _this4.getStructData(cond.field_name, row).val;

                        if (rv == '') rv = '';
                        if (cv == '') cv = '';

                        if (cond.oper == '=' || cond.oper == 'like') {
                            cv = cv.trim().toUpperCase();
                            rv = rv.trim().toUpperCase();
                        }if (cond.oper == '<' || cond.oper == '>' || cond.oper == '>=' || cond.oper == '<=') {
                            cv = isNaN(parseFloat(cv)) ? 0 : parseFloat(cv);
                            rv = isNaN(parseFloat(rv)) ? 0 : parseFloat(rv);
                        }
                        if (cond.oper == '=' && cv == rv) total_found++;else if (cond.oper == '<' && rv < cv) total_found++;else if (cond.oper == '>' && rv > cv) total_found++;else if (cond.oper == '>=' && rv >= cv) total_found++;else if (cond.oper == '<=' && rv <= cv) total_found++;else if (cond.oper == 'like' && rv.search(cv) >= 0) {
                            total_found++;
                        }
                    });
                    return total_found == _this4._where.length;
                });

                this._data = output;
            }
        }

        /**
         * Set the selected field for subset return
         * @private
         */

    }, {
        key: '_setMustFields',
        value: function _setMustFields() {
            var _this5 = this;

            if (this._columns != '*') {
                this._columns.forEach(function (r) {
                    _this5._must_fields.add(r.field_name);
                });

                this._where.forEach(function (r) {
                    _this5._must_fields.add(r.field_name);
                });
                this._having.forEach(function (r) {
                    _this5._must_fields.add(r.field_name);
                });
                //this._must_fields=Array.from(this._must_fields);
                this._must_fields = [].concat(_toConsumableArray(this._must_fields));
            }
        }

        /**
         * getting the datastructure of the selected field.
         * @param k
         * @param data
         * @returns {{struct: {}, val: {}}}
         */

    }, {
        key: 'getStructData',
        value: function getStructData(k, data) {
            var tmp = k.split('.');
            var output = {};
            var current_value = {};

            if (data.hasOwnProperty(tmp[0])) {
                output[tmp[0]] = data[tmp[0]];
                current_value = output[tmp[0]];
            }

            if (tmp.length > 1 && (typeof current_value === 'undefined' ? 'undefined' : _typeof(current_value)) == 'object' && current_value.hasOwnProperty(tmp[1])) {
                var lvl_1_key = tmp[1];
                output[tmp[0]][lvl_1_key] = current_value[lvl_1_key];
                current_value = current_value[lvl_1_key];

                if (tmp.length > 2 && (typeof current_value === 'undefined' ? 'undefined' : _typeof(current_value)) == 'object' && current_value.hasOwnProperty(tmp[2])) {
                    var lvl_2_key = tmp[2];
                    output[tmp[0]][lvl_1_key][lvl_2_key] = current_value[lvl_2_key];
                    current_value = current_value[lvl_2_key];
                    //console.log('IN 2');
                    if (tmp.length > 3 && (typeof current_value === 'undefined' ? 'undefined' : _typeof(current_value)) == 'object' && current_value.hasOwnProperty(tmp[3])) {
                        var lvl_3_key = tmp[3];
                        output[tmp[0]][lvl_1_key][lvl_2_key][lvl_3_key] = current_value[lvl_3_key];
                        current_value = current_value[lvl_3_key];
                        //console.log('IN 3');
                        if (tmp.length > 4 && (typeof current_value === 'undefined' ? 'undefined' : _typeof(current_value)) == 'object' && current_value.hasOwnProperty(tmp[4])) {
                            var lvl_4_key = tmp[4];
                            output[tmp[0]][lvl_1_key][lvl_2_key][lvl_3_key][lvl_4_key] = current_value[lvl_4_key];
                            current_value = current_value[lvl_4_key];

                            //console.log('IN 4');
                            if (tmp.length > 5 && (typeof current_value === 'undefined' ? 'undefined' : _typeof(current_value)) == 'object' && current_value.hasOwnProperty(tmp[5])) {
                                var lvl_5_key = tmp[5];
                                output[tmp[0]][lvl_1_key][lvl_2_key][lvl_3_key][lvl_4_key][lvl_5_key] = current_value[lvl_5_key];
                                //console.log('IN 5');
                            }
                        }
                    }
                }
            }
            return { struct: output, val: current_value };
        }

        /**
         * Picking only selected column.
         * @private
         */

    }, {
        key: '_pickSelectedColumn',
        value: function _pickSelectedColumn() {
            var output = [];
            var uniq_cols_obj = {};
            this._columns.forEach(function (col) {
                var tmp = col.field_name.split('.');
                uniq_cols_obj[tmp[0]] = true;
            });
            var uniq_cols = [];
            for (var col in uniq_cols_obj) {
                uniq_cols.push(col);
            }
            this._data.forEach(function (row) {
                var selected_row = {};
                uniq_cols.forEach(function (col) {
                    selected_row[col] = row[col];
                });
                output.push(selected_row);
            });
            this._data = output;
        }
    }, {
        key: '_aggregate',
        value: function _aggregate() {
            var _this6 = this;

            var output = {};
            this._columns.forEach(function (ck) {
                if (ck.method == '') {
                    _this6._pickcol.push(ck);
                } else {
                    _this6._aggcol.push(ck);
                }
            });

            this._data.forEach(function (row) {
                var k = '';
                _this6._pickcol.forEach(function (ck) {
                    k += row[ck.field_name];
                });
                if (!output.hasOwnProperty(k)) {
                    output[k] = row;
                }

                _this6._aggcol.forEach(function (ck) {
                    if (!output[k].hasOwnProperty(ck.alias_name)) output[k][ck.alias_name] = [];
                    output[k][ck.alias_name].push(row[ck.field_name]);
                });
            });

            this._data = [];

            var _loop = function _loop(row_k) {
                var row = output[row_k];
                _this6._aggcol.forEach(function (ck) {
                    var ag_k = ck.alias_name;
                    if (ck.method == 'max') {
                        row[ag_k] = Math.max.apply(Math, _toConsumableArray(row[ag_k]));
                    } else if (ck.method == 'min') {
                        row[ag_k] = Math.min.apply(Math, _toConsumableArray(row[ag_k]));
                    } else if (ck.method == 'count') {
                        row[ag_k] = row[ag_k].length;
                    } else if (ck.method == 'sum') {
                        row[ag_k] = row[ag_k].reduce(function (a, b) {
                            return a + b;
                        }, 0);
                    } else if (ck.method == 'avg') {
                        row[ag_k] = row[ag_k].reduce(function (a, b) {
                            return a + b;
                        }, 0) / row[ag_k].length;
                    } else {
                        row[ag_k] = 0;
                    }
                });
                _this6._data.push(row);
            };

            for (var row_k in output) {
                _loop(row_k);
            }
        }

        /**
         * Filter dataset after aggration function.
         * @returns {boolean}
         * @private
         */

    }, {
        key: '_havingFilter',
        value: function _havingFilter() {
            var _this7 = this;

            if (this._having.length > 0) {
                var total_search = this._having.length;
                this._data = this._data.filter(function (r) {
                    var found_count = 0;
                    _this7._having.forEach(function (cond) {
                        if (cond.oper == '>' && r[cond.field_name] > cond.v) found_count++;else if (cond.oper == '<' && r[cond.field_name] < cond.v) found_count++;else if (cond.oper == '>=' && r[cond.field_name] >= cond.v) found_count++;else if (cond.oper == '<=' && r[cond.field_name] <= cond.v) found_count++;
                    });
                    return total_search == found_count;
                });
            }
        }
    }, {
        key: 'fetch',
        value: function fetch() {
            this._setMustFields();
            this._setFilterData();
            this._pickSelectedColumn();
            this._aggregate();
            this._havingFilter();
            this._setOrderBy();
            return this._data;
        }
    }]);

    return JSONSql;
}();

module.exports = JSONSql;