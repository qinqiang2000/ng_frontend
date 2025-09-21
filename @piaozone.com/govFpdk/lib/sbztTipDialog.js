'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _modal = require('antd/lib/modal');

var _modal2 = _interopRequireDefault(_modal);

var _radio = require('antd/lib/radio');

var _radio2 = _interopRequireDefault(_radio);

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

require('antd/lib/radio/style');

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _dva = require('dva');

require('../media/css/caCheckDialog.css');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SbztDialog = function (_React$Component) {
	(0, _inherits3.default)(SbztDialog, _React$Component);

	function SbztDialog(props) {
		(0, _classCallCheck3.default)(this, SbztDialog);

		var _this = (0, _possibleConstructorReturn3.default)(this, (SbztDialog.__proto__ || (0, _getPrototypeOf2.default)(SbztDialog)).apply(this, arguments));

		_this.onCancel = function () {
			typeof _this.props.onCancel === 'function' && _this.props.onCancel();
		};

		_this.confirmSbzt = _this.confirmSbzt.bind(_this);
		_this._isMounted = false;
		_this.state = {
			showDialog: props.visible,
			skssq: props.skssq || '',
			confirming: false,
			sbzt: ''
		};
		return _this;
	}

	(0, _createClass3.default)(SbztDialog, [{
		key: 'componentDidMount',
		value: function componentDidMount() {
			this._isMounted = true;
		}
	}, {
		key: 'componentWillReceiveProps',
		value: function componentWillReceiveProps(nextProps) {
			if (this._isMounted) {
				this.setState({
					skssq: nextProps.skssq
				});
			}
		}
	}, {
		key: 'componentWillUnmount',
		value: function componentWillUnmount() {
			this._isMounted = false;
		}
	}, {
		key: 'confirmSbzt',
		value: function confirmSbzt() {
			this.props.onConfirm({ sbzt: this.state.sbzt });
		}
	}, {
		key: 'render',
		value: function render() {
			var _this2 = this;

			var _state = this.state,
			    showDialog = _state.showDialog,
			    sbzt = _state.sbzt,
			    skssq = _state.skssq;

			var visible = this.props.visible;

			if (skssq !== '') {
				var curSkssq = skssq[0].substr(0, 4) + '年' + skssq[0].substr(4, 2) + '月';
				var nextSkssq = skssq[2].substr(0, 4) + '年' + skssq[2].substr(4, 2) + '月';
				return _react2.default.createElement(
					_modal2.default,
					{
						visible: visible,
						title: '\u9009\u62E9\u7533\u62A5\u72B6\u6001',
						className: 'authDialog',
						onOk: this.confirmSbzt,
						onCancel: this.onCancel
					},
					_react2.default.createElement(
						'div',
						{ style: { marginBottom: 15, fontWeight: 'bold' } },
						'\u5C0A\u656C\u7684\u7EB3\u7A0E\u4EBA\uFF1A\u56E0\u83B7\u53D6\u60A8\u7A0E\u6B3E\u6240\u5C5E\u671F',
						curSkssq,
						'\u7684\u7533\u62A5\u7ED3\u679C\u4FE1\u606F\u6709\u5EF6\u8FDF\uFF0C\u8BF7\u60A8\u9009\u62E9\u662F\u5426\u5DF2\u5B8C\u6210\u7A0E\u6B3E\u6240\u5C5E\u671F',
						curSkssq,
						'\u7684\u589E\u503C\u7A0E\u7533\u62A5\u5DE5\u4F5C!'
					),
					_react2.default.createElement(
						'div',
						{ style: { marginBottom: 10 } },
						_react2.default.createElement(
							_radio2.default,
							{ checked: sbzt === '1', onClick: function onClick() {
									return _this2.setState({ sbzt: '1' });
								}, style: { color: 'red' } },
							'\u672A\u5B8C\u6210\u7533\u62A5'
						),
						_react2.default.createElement(
							'p',
							null,
							'\u53EF\u4EE5\u7EE7\u7EED\u8FDB\u884C\u7A0E\u6B3E\u6240\u5C5E\u671F',
							curSkssq,
							'\u7684\u786E\u8BA4\u52FE\u9009\uFF01'
						)
					),
					_react2.default.createElement(
						'div',
						{ style: { marginBottom: 10 } },
						_react2.default.createElement(
							_radio2.default,
							{ checked: sbzt === '2', onClick: function onClick() {
									return _this2.setState({ sbzt: '2' });
								}, style: { color: 'red' } },
							'\u5DF2\u7533\u62A5'
						),
						_react2.default.createElement(
							'p',
							null,
							'\u7CFB\u7EDF\u5C06\u56DE\u9000\u60A8\u7A0E\u6B3E\u6240\u5C5E\u671F',
							curSkssq,
							'\u5DF2\u52FE\u9009\u672A\u786E\u8BA4\u7684\u53D1\u7968\uFF0C\u5E76\u628A\u60A8\u7684\u7A0E\u6B3E\u6240\u5C5E\u671F\u5207\u6362\u5230',
							nextSkssq,
							',\u60A8\u53EF\u4EE5\u8FDB\u884C\u7A0E\u6B3E\u6240\u5C5E\u671F',
							nextSkssq,
							'\u7684\u53D1\u7968\u786E\u8BA4\u52FE\u9009\uFF01'
						)
					),
					_react2.default.createElement(
						'div',
						null,
						_react2.default.createElement(
							_radio2.default,
							{ checked: sbzt === '3', onClick: function onClick() {
									return _this2.setState({ sbzt: '3' });
								}, style: { color: 'red' } },
							'\u4E0D\u786E\u5B9A'
						),
						_react2.default.createElement(
							'p',
							null,
							'\u60A8\u9700\u8981\u5148\u53BB\u786E\u5B9A\u60A8\u7A0E\u6B3E\u6240\u5C5E\u671F',
							curSkssq,
							'\u7684\u589E\u503C\u7A0E\u7533\u62A5\u5DE5\u4F5C\u662F\u5426\u5DF2\u5B8C\u6210\uFF01'
						)
					)
				);
			} else {
				return null;
			}
		}
	}]);
	return SbztDialog;
}(_react2.default.Component);

exports.default = (0, _dva.connect)()(SbztDialog);