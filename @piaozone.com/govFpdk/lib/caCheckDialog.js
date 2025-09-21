'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _modal = require('antd/lib/modal');

var _modal2 = _interopRequireDefault(_modal);

var _input = require('antd/lib/input');

var _input2 = _interopRequireDefault(_input);

var _message2 = require('antd/lib/message');

var _message3 = _interopRequireDefault(_message2);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

require('antd/lib/modal/style');

require('antd/lib/input/style');

require('antd/lib/message/style');

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _dva = require('dva');

var _label = require('@piaozone.com/label');

var _label2 = _interopRequireDefault(_label);

require('../media/css/caCheckDialog.css');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CacheckDialog = function (_React$Component) {
    (0, _inherits3.default)(CacheckDialog, _React$Component);

    function CacheckDialog(props) {
        (0, _classCallCheck3.default)(this, CacheckDialog);

        var _this = (0, _possibleConstructorReturn3.default)(this, (CacheckDialog.__proto__ || (0, _getPrototypeOf2.default)(CacheckDialog)).apply(this, arguments));

        _this.onCancel = function () {
            typeof _this.props.onCancel === 'function' && _this.props.onCancel();
        };

        _this.taxDiskAuth = _this.taxDiskAuth.bind(_this);

        _this.state = {
            showDialog: props.visible,
            confirming: false,
            caPasswd: '',
            ptPasswd: ''
        };
        return _this;
    }

    (0, _createClass3.default)(CacheckDialog, [{
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {}
    }, {
        key: 'taxDiskAuth',
        value: function taxDiskAuth() {
            var _state = this.state,
                caPasswd = _state.caPasswd,
                ptPasswd = _state.ptPasswd;

            if (caPasswd.length < 6) {
                _message3.default.info('请先输入正确的CA密码');
                return false;
            }

            this.props.onConfirm({ caPasswd: caPasswd, ptPasswd: ptPasswd });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _state2 = this.state,
                showDialog = _state2.showDialog,
                confirming = _state2.confirming,
                caPasswd = _state2.caPasswd,
                ptPasswd = _state2.ptPasswd;

            var visible = this.props.visible;

            return _react2.default.createElement(
                _modal2.default,
                {
                    visible: visible,
                    title: this.props.title || '税控企业认证',
                    className: 'authDialog',
                    confirmLoading: this.state.confirming,
                    onOk: this.taxDiskAuth,
                    onCancel: this.onCancel
                },
                _react2.default.createElement(
                    'div',
                    { className: 'caCheckDialog' },
                    _react2.default.createElement(
                        'div',
                        { className: 'centerRow', style: { margin: '30px 0 30px 0', textAlign: 'center' } },
                        _react2.default.createElement(
                            _label2.default,
                            null,
                            '\u7A0E\u76D8CA\u5BC6\u7801:'
                        ),
                        _react2.default.createElement(_input2.default, {
                            autoFocus: true,
                            type: 'password',
                            value: caPasswd,
                            placeholder: '\u8BF7\u8F93\u5165\u7A0E\u63A7CA\u5BC6\u7801',
                            onChange: function onChange(e) {
                                return _this2.setState({ caPasswd: e.target.value });
                            },
                            onPressEnter: this.taxDiskAuth
                        })
                    ),
                    _react2.default.createElement(
                        'div',
                        { className: 'centerRow', style: { margin: '0 0 20px 0', textAlign: 'center' } },
                        _react2.default.createElement(
                            _label2.default,
                            null,
                            '\u52FE\u9009\u5E73\u53F0\u5BC6\u7801:'
                        ),
                        _react2.default.createElement(_input2.default, {
                            type: 'password',
                            value: ptPasswd,
                            placeholder: '\u5982\u679C\u6CA1\u6709\u8BBE\u7F6E\u5E73\u53F0\u5BC6\u7801\u53EF\u4E3A\u7A7A',
                            onChange: function onChange(e) {
                                return _this2.setState({ ptPasswd: e.target.value });
                            },
                            onPressEnter: this.taxDiskAuth
                        })
                    ),
                    _react2.default.createElement(
                        'div',
                        { className: 'row', style: { textAlign: 'center', fontSize: '12px', color: '#ffac38' } },
                        _react2.default.createElement(
                            'p',
                            { className: 'tip' },
                            '\u8BF7\u5148\u4E0B\u8F7D\u4F01\u4E1A\u8BA4\u8BC1\u7EC4\u4EF6, \u5E76\u786E\u5B9A\u542F\u52A8\u8BA4\u8BC1\u670D\u52A1! ',
                            _react2.default.createElement(
                                'a',
                                { className: 'download', href: window.staticUrl + '/download/company_auth.rar', style: { marginLeft: '10px' } },
                                '\u8BA4\u8BC1\u7EC4\u4EF6\u4E0B\u8F7D'
                            )
                        )
                    )
                )
            );
        }
    }]);
    return CacheckDialog;
}(_react2.default.Component);

exports.default = (0, _dva.connect)()(CacheckDialog);