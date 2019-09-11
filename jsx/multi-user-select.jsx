// plugin/jenkins/multi-user-select
import Select from 'react-select';
import $ from 'jquery';
import _ from 'underscore';

class KeyOrUserOption extends React.Component {
  handleMouseDown (event) {
    event.preventDefault();
    event.stopPropagation();
    this.props.onSelect(this.props.option, event);
  }
  handleMouseEnter (event) {
    this.props.onFocus(this.props.option, event);
  }
  handleMouseMove (event) {
    if (this.props.isFocused) return;
    this.props.onFocus(this.props.option, event);
  }  
  render () {
    const option = this.props.option,
          isAccessKey = (option.type === "accessKey"),
          isUser = (option.type === "user");


    return (
      <div className={this.props.className}
          onMouseDown={this.handleMouseDown.bind(this)}
          onMouseEnter={this.handleMouseEnter.bind(this)}
          onMouseMove={this.handleMouseMove.bind(this)}
          title={this.props.option.title}>
          {isAccessKey && 
            <span className="aui-avatar aui-avatar-small key-avatar"></span>
          }
          {isUser && 
            <span className="aui-avatar aui-avatar-small user-avatar">
              <span className="aui-avatar-inner">
                <img src={window.AJS.contextPath() + "/users/" + option.value + "/avatar.png?s=48&amp;d=mm"}/>
              </span>
            </span>            
          }

         {this.props.children}
      </div>
    );
  }  
}

class KeyOrUserValue extends React.Component {
  onIconClick(event) {
      event.preventDefault();
      event.stopPropagation();
      this.props.onRemove(this.props.value);
  }
  render () {
    const value = this.props.value,
          isAccessKey = (value.type === "accessKey"),
          isUser = (value.type === "user");

    return (
      <div className="Select-value" title={this.props.value.title}>
        <span onClick={this.onIconClick.bind(this)} className="Select-value-icon" aria-hidden="true">×</span>
        <span className="Select-value-label">
          {isAccessKey && 
            <span className="aui-avatar aui-avatar-xsmall key-avatar"></span>
          }
          {isUser && 
            <span className="aui-avatar aui-avatar-xsmall user-avatar">
              <span className="aui-avatar-inner">
                <img src={window.AJS.contextPath() + "/users/" + value.value + "/avatar.png?s=48&amp;d=mm"}/>
              </span>
            </span>            
          }
          {this.props.children}
        </span>
      </div>);
  }
}
const ajaxOptions = {
            headers : {
               "X-Atlassian-Token": "no-check"
            },
            credentials: 'same-origin'
          };


class MultiUserSelect extends React.Component {
    constructor(props) {
        super(props);

        var value = [],
            users = props.users ? (props.users + "").split(',') : [],
            accessKeys = props.accessKeys ? (props.accessKeys + "").split(',') : [];

        value = value.concat(users);
        value = value.concat(accessKeys);

        this.state = {
          users,
          accessKeys,
          value
        }; 
    }

    handleChange(value, callback) {
        var users = [], accessKeys = [];

        _.each(value, function(item) {
          if (item.type === 'user') {
            users.push(item.value);
          } else if (item.type === 'accessKey') {
            accessKeys.push(item.value);
          }
        });

        this.setState({ 
          value,
          users,
          accessKeys
        });
    }
    getOptions (input) {
        var projectKey = this.props.projectKey,
            repositorySlug = this.props.repositorySlug;

        return !this.initialOptions ? 
              this.getInitialOptions(projectKey, repositorySlug)
              : this.getOptionsByQuery(projectKey, repositorySlug, input);
        
    }
    getInitialOptions(projectKey, repositorySlug, input) {
      var users = this.props.users,
          accessKeys = this.props.accessKeys,
          url = AJS.contextPath() + '/rest/jenkins/latest/projects/' + 
                projectKey + (!!repositorySlug ? '/repos/' + repositorySlug : '') 
                + '/committer-options?' + $.param({users: users, accessKeys : accessKeys});

      return fetch(url, ajaxOptions).then((response) => {return response.json();}).then((options) => {
        this.initialOptions = options;

        this.cleanUpValue(options);

        return {options};
      });
    }

    getOptionsByQuery(projectKey, repositorySlug, input) {
      const repositoryParams = {
              filter : input,
              permission : 'REPO_WRITE'
            },
            projectParams = {
              filter : input,
              permission : 'PROJECT_WRITE'
            },
            query = (input ? ("?" + $.param({filter : input})) : "");

      var urls = [
            AJS.contextPath() + '/rest/api/latest/users' +  query, 
            AJS.contextPath() + '/rest/keys/latest/projects/' + projectKey + '/ssh?' +  $.param(projectParams)
          ];

      if (repositorySlug){
        urls.push(AJS.contextPath() + '/rest/keys/latest/projects/' + projectKey + '/repos/' + repositorySlug + '/ssh?' +  $.param(repositoryParams));
      }

      return Promise.all(urls.map(url=>fetch(url, ajaxOptions).then((response) => {return response.json();}))).then(responses => {
          var options = [...this.initialOptions];

          for (var i = 0; i < responses.length; i++) {
            var fetched = _.map(responses[i].values, (item) => {
                return item.key ? 
                  {
                      value : item.key.label,
                      label : item.key.label,
                      type: 'accessKey'
                  } :
                  {
                      value : item.name,
                      label : item.displayName,
                      type:  'user'
                  }
            });
            options = options.concat(fetched);
          }

          return {options : options};
        });

    }
    cleanUpValue(options) {
      var users = [... this.state.users],
          accessKeys = [... this.state.accessKeys],
          value = [], found;


      //users
      for (var i = 0; i < users.length; i++ ){
        found = !!options.find((item) => item.value === users[i]);
        if (!found) {
          users.splice(i,1);
        }

      }
      //accessKeys
      for (var i = 0; i < accessKeys.length; i++ ){
        found = !!options.find((item) => item.value === accessKeys[i]);
        if (!found) {
          accessKeys.splice(i,1);
        }
      }

      value = value.concat(users);
      value = value.concat(accessKeys);


      this.setState({
        value,
        users,
        accessKeys
      });

    }

    render() {
        var users = this.state.users.join(','),
            accessKeys = this.state.accessKeys.join(',');

        var filterOptions=function(options, filter, currentValues) {
          // Do no filtering, just return all options
          return options;
        };          


        return ( 
            <div>
              <input type="hidden" name='ignoreCommitters' value={users}/>
              <input type="hidden" name='ignoreAccessKeys' value={accessKeys}/>
              <Select.Async
                joinValues
                className="long-field adg2-react-select"
                multi
                filterOptions
                optionComponent={KeyOrUserOption}
                value={this.state.value}
                loadOptions={this.getOptions.bind(this)}
                valueComponent={KeyOrUserValue}
                onChange={this.handleChange.bind(this)}
              />
            </div>
        );
    }
}
export default MultiUserSelect;