define('plugin/jenkins/multi-user-select', ['exports', 'react-select', 'jquery', 'underscore'], function (exports, _reactSelect, _jquery, _underscore) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _reactSelect2 = _interopRequireDefault(_reactSelect);

  var _jquery2 = _interopRequireDefault(_jquery);

  var _underscore2 = _interopRequireDefault(_underscore);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  function _toConsumableArray(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

      return arr2;
    } else {
      return Array.from(arr);
    }
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  var KeyOrUserOption = function (_React$Component) {
    _inherits(KeyOrUserOption, _React$Component);

    function KeyOrUserOption() {
      _classCallCheck(this, KeyOrUserOption);

      return _possibleConstructorReturn(this, (KeyOrUserOption.__proto__ || Object.getPrototypeOf(KeyOrUserOption)).apply(this, arguments));
    }

    _createClass(KeyOrUserOption, [{
      key: 'handleMouseDown',
      value: function handleMouseDown(event) {
        event.preventDefault();
        event.stopPropagation();
        this.props.onSelect(this.props.option, event);
      }
    }, {
      key: 'handleMouseEnter',
      value: function handleMouseEnter(event) {
        this.props.onFocus(this.props.option, event);
      }
    }, {
      key: 'handleMouseMove',
      value: function handleMouseMove(event) {
        if (this.props.isFocused) return;
        this.props.onFocus(this.props.option, event);
      }
    }, {
      key: 'render',
      value: function render() {
        var option = this.props.option,
            isAccessKey = option.type === "accessKey",
            isUser = option.type === "user";

        return React.createElement(
          'div',
          { className: this.props.className,
            onMouseDown: this.handleMouseDown.bind(this),
            onMouseEnter: this.handleMouseEnter.bind(this),
            onMouseMove: this.handleMouseMove.bind(this),
            title: this.props.option.title },
          isAccessKey && React.createElement('span', { className: 'aui-avatar aui-avatar-small key-avatar' }),
          isUser && React.createElement(
            'span',
            { className: 'aui-avatar aui-avatar-small user-avatar' },
            React.createElement(
              'span',
              { className: 'aui-avatar-inner' },
              React.createElement('img', { src: window.AJS.contextPath() + "/users/" + option.value + "/avatar.png?s=48&amp;d=mm" })
            )
          ),
          this.props.children
        );
      }
    }]);

    return KeyOrUserOption;
  }(React.Component);

  var KeyOrUserValue = function (_React$Component2) {
    _inherits(KeyOrUserValue, _React$Component2);

    function KeyOrUserValue() {
      _classCallCheck(this, KeyOrUserValue);

      return _possibleConstructorReturn(this, (KeyOrUserValue.__proto__ || Object.getPrototypeOf(KeyOrUserValue)).apply(this, arguments));
    }

    _createClass(KeyOrUserValue, [{
      key: 'onIconClick',
      value: function onIconClick(event) {
        event.preventDefault();
        event.stopPropagation();
        this.props.onRemove(this.props.value);
      }
    }, {
      key: 'render',
      value: function render() {
        var value = this.props.value,
            isAccessKey = value.type === "accessKey",
            isUser = value.type === "user";

        return React.createElement(
          'div',
          { className: 'Select-value', title: this.props.value.title },
          React.createElement(
            'span',
            { onClick: this.onIconClick.bind(this), className: 'Select-value-icon', 'aria-hidden': 'true' },
            '\xD7'
          ),
          React.createElement(
            'span',
            { className: 'Select-value-label' },
            isAccessKey && React.createElement('span', { className: 'aui-avatar aui-avatar-xsmall key-avatar' }),
            isUser && React.createElement(
              'span',
              { className: 'aui-avatar aui-avatar-xsmall user-avatar' },
              React.createElement(
                'span',
                { className: 'aui-avatar-inner' },
                React.createElement('img', { src: window.AJS.contextPath() + "/users/" + value.value + "/avatar.png?s=48&amp;d=mm" })
              )
            ),
            this.props.children
          )
        );
      }
    }]);

    return KeyOrUserValue;
  }(React.Component);

  var ajaxOptions = {
    headers: {
      "X-Atlassian-Token": "no-check"
    },
    credentials: 'same-origin'
  };

  var MultiUserSelect = function (_React$Component3) {
    _inherits(MultiUserSelect, _React$Component3);

    function MultiUserSelect(props) {
      _classCallCheck(this, MultiUserSelect);

      var _this3 = _possibleConstructorReturn(this, (MultiUserSelect.__proto__ || Object.getPrototypeOf(MultiUserSelect)).call(this, props));

      var value = [],
          users = props.users ? (props.users + "").split(',') : [],
          accessKeys = props.accessKeys ? (props.accessKeys + "").split(',') : [];

      value = value.concat(users);
      value = value.concat(accessKeys);

      _this3.state = {
        users: users,
        accessKeys: accessKeys,
        value: value
      };
      return _this3;
    }

    _createClass(MultiUserSelect, [{
      key: 'handleChange',
      value: function handleChange(value, callback) {
        var users = [],
            accessKeys = [];

        _underscore2.default.each(value, function (item) {
          if (item.type === 'user') {
            users.push(item.value);
          } else if (item.type === 'accessKey') {
            accessKeys.push(item.value);
          }
        });

        this.setState({
          value: value,
          users: users,
          accessKeys: accessKeys
        });
      }
    }, {
      key: 'getOptions',
      value: function getOptions(input) {
        var projectKey = this.props.projectKey,
            repositorySlug = this.props.repositorySlug;

        return !this.initialOptions ? this.getInitialOptions(projectKey, repositorySlug) : this.getOptionsByQuery(projectKey, repositorySlug, input);
      }
    }, {
      key: 'getInitialOptions',
      value: function getInitialOptions(projectKey, repositorySlug, input) {
        var _this4 = this;

        var users = this.props.users,
            accessKeys = this.props.accessKeys,
            url = AJS.contextPath() + '/rest/jenkins/latest/projects/' + projectKey + (!!repositorySlug ? '/repos/' + repositorySlug : '') + '/committer-options?' + _jquery2.default.param({ users: users, accessKeys: accessKeys });

        return fetch(url, ajaxOptions).then(function (response) {
          return response.json();
        }).then(function (options) {
          _this4.initialOptions = options;

          _this4.cleanUpValue(options);

          return { options: options };
        });
      }
    }, {
      key: 'getOptionsByQuery',
      value: function getOptionsByQuery(projectKey, repositorySlug, input) {
        var _this5 = this;

        var repositoryParams = {
          filter: input,
          permission: 'REPO_WRITE'
        },
            projectParams = {
          filter: input,
          permission: 'PROJECT_WRITE'
        },
            query = input ? "?" + _jquery2.default.param({ filter: input }) : "";

        var urls = [AJS.contextPath() + '/rest/api/latest/users' + query, AJS.contextPath() + '/rest/keys/latest/projects/' + projectKey + '/ssh?' + _jquery2.default.param(projectParams)];

        if (repositorySlug) {
          urls.push(AJS.contextPath() + '/rest/keys/latest/projects/' + projectKey + '/repos/' + repositorySlug + '/ssh?' + _jquery2.default.param(repositoryParams));
        }

        return Promise.all(urls.map(function (url) {
          return fetch(url, ajaxOptions).then(function (response) {
            return response.json();
          });
        })).then(function (responses) {
          var options = [].concat(_toConsumableArray(_this5.initialOptions));

          for (var i = 0; i < responses.length; i++) {
            var fetched = _underscore2.default.map(responses[i].values, function (item) {
              return item.key ? {
                value: item.key.label,
                label: item.key.label,
                type: 'accessKey'
              } : {
                value: item.name,
                label: item.displayName,
                type: 'user'
              };
            });
            options = options.concat(fetched);
          }

          return { options: options };
        });
      }
    }, {
      key: 'cleanUpValue',
      value: function cleanUpValue(options) {
        var users = [].concat(_toConsumableArray(this.state.users)),
            accessKeys = [].concat(_toConsumableArray(this.state.accessKeys)),
            value = [],
            found;

        //users
        for (var i = 0; i < users.length; i++) {
          found = !!options.find(function (item) {
            return item.value === users[i];
          });
          if (!found) {
            users.splice(i, 1);
          }
        }
        //accessKeys
        for (var i = 0; i < accessKeys.length; i++) {
          found = !!options.find(function (item) {
            return item.value === accessKeys[i];
          });
          if (!found) {
            accessKeys.splice(i, 1);
          }
        }

        value = value.concat(users);
        value = value.concat(accessKeys);

        this.setState({
          value: value,
          users: users,
          accessKeys: accessKeys
        });
      }
    }, {
      key: 'render',
      value: function render() {
        var users = this.state.users.join(','),
            accessKeys = this.state.accessKeys.join(',');

        var filterOptions = function filterOptions(options, filter, currentValues) {
          // Do no filtering, just return all options
          return options;
        };

        return React.createElement(
          'div',
          null,
          React.createElement('input', { type: 'hidden', name: 'ignoreCommitters', value: users }),
          React.createElement('input', { type: 'hidden', name: 'ignoreAccessKeys', value: accessKeys }),
          React.createElement(_reactSelect2.default.Async, {
            joinValues: true,
            className: 'long-field adg2-react-select',
            multi: true,
            filterOptions: true,
            optionComponent: KeyOrUserOption,
            value: this.state.value,
            loadOptions: this.getOptions.bind(this),
            valueComponent: KeyOrUserValue,
            onChange: this.handleChange.bind(this)
          })
        );
      }
    }]);

    return MultiUserSelect;
  }(React.Component);

  exports.default = MultiUserSelect;
});
