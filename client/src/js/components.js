class LoadingListItem extends React.Component {
  componentDidMount() {
    $(".spinner").spin();
  }

  render() {
    return (
      <li className="aui-connect-list-item">
        <span className="aui-avatar aui-avatar-medium">
          <div className="spinner" style={{margin: "10px"}}></div>
        </span>
        <span className="aui-connect-list-item-title">Loading latest data...</span>
      </li>
    );
  }
}

class ListItem extends React.Component {
  hasActions() {
    return (
      typeof this.props.actions !== 'undefined'
      && this.props.actions.length > 0
    );
  }

  getActionsIfAny() {
    if (this.hasActions()) {
      const key = this.props.index;
      const actions = this.props.actions.map((action, index) =>
        <li key={index}><a href="{action.href}">{action.text}</a></li>);

      return (
        <div className="aui-connect-list-item-actions">
          <button className="aui-dropdown2-trigger aui-button aui-dropdown2-trigger-arrowless" aria-owns={'list-item-' + key}
              aria-haspopup="true" id={'list-item-' + key + '-action-menu'} data-no-focus="true">
            <span className="aui-icon aui-icon-small aui-iconfont-more"></span>
          </button>
          <div id={'list-item-' + key} className="aui-style-default aui-dropdown2 aui-connect-list-item-action">
            <ul className="aui-list-truncate">
              {actions}
            </ul>
          </div>
        </div>
      );
    }
  }

  hasSecondaryText() {
    return this.props.secondaryText && this.props.secondaryText.length > 0;
  }

  getSecondaryTextIfAny() {
    if (this.hasSecondaryText()) {
      const secondaryText = this.props.secondaryText.map((body, index) =>
        (<li key={index}>{body}</li>));

      return (
        <ul className="aui-connect-list-item-attributes">
          {secondaryText}
        </ul>
      );
    }
  }

  render() {
    const isClickable = typeof this.props.onclick === 'function';
    const onclick = this.props.onclick || () => {};
    return (
      <li className={isClickable ? 'clickable-list-item aui-connect-list-item' : 'aui-connect-list-item'} onClick={onclick}>
        { this.getActionsIfAny() }
        <span className="aui-avatar aui-avatar-medium">
          <span className="aui-avatar-inner">
            <img style={{backgroundColor: '#ccc'}} />
          </span>
        </span>
        <span className="aui-connect-list-item-title">{this.props.title}</span>
        { this.getSecondaryTextIfAny() }
      </li>
    );
  }
}

class TopicList extends React.Component {
  getStatusCounts(alarms) {
    let statusCounts = {};
    alarms.forEach(alarm => {
      if (typeof statusCounts[alarm.NewStateValue] === 'undefined') {
        statusCounts[alarm.NewStateValue] = 0;
      }
      statusCounts[alarm.NewStateValue]++;
    });

    return statusCounts;
  }

  renderedStatusCounts(statusCounts) {
    return Object.keys(statusCounts).map(status =>
      <span className={getLozengeClassNameForStatus(status)}>{statusCounts[status] + ' x ' + status}</span>);
  }

  render() {
    const loadingListItem = this.props.loading ? <LoadingListItem /> : undefined;
    const topicList = this.props.topics.map((topic, index) => {
      console.log(topic);
      return (<ListItem
        key={index}
        index={index}
        title={topic.title}
        actions={topic.actions}
        onclick={() => { this.props.selectTopic(topic.title) }}
        secondaryText={ this.renderedStatusCounts(this.getStatusCounts(topic.alarms)) }
      />)
    });
    return (
      <section className="aui-connect-content with-list">
        <ol className="aui-connect-list">
          {loadingListItem}
          {topicList}
        </ol>
      </section>
    );
  }
}

class AlarmList extends React.Component {
  render() {
    const alarmList = this.props.alarms.map((alarm, index) => (
      <ListItem
        key={index}
        index={index}
        title={alarm.AlarmName}
        secondaryText={[
          <span className={getLozengeClassNameForStatus(alarm.NewStateValue)}>{alarm.NewStateValue}</span>,
          alarm.AlarmDescription
        ]}
      />));
    return (
      <section className="aui-connect-content with-list">
        <a className="aui-connect-back" onClick={this.props.back}>Back</a>
        <ol className="aui-connect-list">
          {alarmList}
        </ol>
      </section>
    );
  }
}

class Sidebar extends React.Component {
  constructor() {
    super();
    this.state = {
      topics: [],
      loading: false,
      topicName: null,
      alarmName: null
    };

    this.setTopicName = this.setTopicName.bind(this);
    this.unsetTopicName = this.unsetTopicName.bind(this);
    this.unsetAlarmName = this.unsetAlarmName.bind(this);
  }

  setTopicName(topicName) {
    this.setState({ topicName: topicName });
  }

  unsetTopicName() {
    this.setState({ topicName: null });
  }

  unsetAlarmName() {
    this.setState({ alarmName: null });
  }

  getData() {
    this.setState({ loading: true });
    HipChat.auth.withToken((err, token) => {
      this.dataRequest = $.ajax({
        type: 'POST',
        url: '${host}/topics',
        headers: { authorization: 'JWT ' + token },
        data: JSON.stringify({ topicGroupKey: this.props.sidebarModuleKey.split(/\./)[1] }),
        crossDomain: true,
        contentType: 'application/json',
        dataType: 'json',
        success: function(data) {
          this.setState({ loading: false, topics: data.topics });
        }.bind(this),
        error: function (response, jqXHR, status) {
          this.setState({ loading: false });
          if (response.status !== 200) {
            alert('fail' + status.code);
          }
        }.bind(this)
      });
    });

  }

  getTopicList() {
    return (
      <section className="aui-connect-page" role="main">
        <TopicList
          topics={this.state.topics}
          selectTopic={this.setTopicName}
          loading={this.state.loading}
        />
      </section>);
  }

  getAlarmList(topicName) {
    const topic = this.state.topics.find(topic => topic.title === topicName);
    return (
      <section className="aui-connect-page" role="main">
        <AlarmList
          alarms={topic && topic.alarms ? topic.alarms : []}
          back={this.unsetTopicName}
          loading={this.state.loading}
        />
      </section>);
  }

  getEmptyState() {
    return (
      <section className="aui-connect-page aui-connect-page-focused" role="main">
      	<section className="aui-connect-content">
      		<div className="aui-connect-content-inner">
      				<img src="/img/logo.png" style={{height: "100px"}} />
      				<h1>Could not retrieve any topics</h1>
      				<p>Please try again later, or raise an issue in Bitbucket</p>
      				<div className="aui-buttons">
      					<a className="aui-button aui-button-primary" href="https://bitbucket.org/gorillastack/serverless-hipchat-sns-cloudwatch-alarms">Repository</a>
      					<button className="aui-button aui-button-default" onClick={() => { HipChat.sidebar.closeView() }}>Close Sidebar</button>
      			</div>
      		</div>
      	</section>
      </section>
    );
  }

  componentWillMount() {
    this.getData();
    HipChat.register({
      'glance-update': function(data) {
        if (data.module_key === this.props.parentGlanceModuleKey) {
          this.getData();
        }
      }.bind(this)
    })
  }

  componentWillUnmount() {
    if (this.dataRequest) {
      this.dataRequest.abort();
    }
  }

  render() {
    const state = this.state;
    if (state.loading === false && state.topics.length === 0) {
      return this.getEmptyState();
    } else if (state.topicName) {
      return this.getAlarmList(state.topicName);
    } else {
      return this.getTopicList();
    }
  }
}

const getQueryParam = key => {
  const url = window.location.href;
  key = key.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp('[?&]' + key + '(=([^&#]*)|&|#|$)');
  let results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
};

const getLozengeClassNameForStatus = status => {
  let className = 'aui-lozenge ';
  if (status === 'OK') {
    className += 'aui-lozenge-success';
  } else if (status === 'INSUFFICIENT_DATA') {
    className += 'aui-lozenge-current';
  } else if (status === 'ALERT') {
    className += 'aui-lozenge-error';
  }

  return className;
};

// Insert into DOM
ReactDOM.render(
  <Sidebar
    sidebarModuleKey={getQueryParam('sidebar-module-key')}
    parentGlanceModuleKey={getQueryParam('parent-glance-module-key')}
  />,
  document.getElementById('content')
);
