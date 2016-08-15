
const ListItem = React.createClass({
  hasActions: function() {
    return (
      typeof this.props.actions !== 'undefined'
      && this.props.actions.length > 0
    );
  },

  getActionsIfAny: function() {
    if (this.hasActions()) {
      const actions = this.props.actions.map((action, index) =>
        <li key={index}><a href="{action.href}">{action.text}</a></li>);

      return (
        <div className="aui-connect-list-item-actions">
          <button className="aui-dropdown2-trigger aui-button aui-dropdown2-trigger-arrowless" aria-owns="list-item-1"
              aria-haspopup="true" id="list-item-1-action-menu" data-no-focus="true">
            <span className="aui-icon aui-icon-small aui-iconfont-more"></span>
          </button>
          <div id="list-item-1" className="aui-style-default aui-dropdown2 aui-connect-list-item-action">
            <ul className="aui-list-truncate">
              {actions}
            </ul>
          </div>
        </div>
      );
    }
  },

  hasSecondaryText: function() {
    return this.props.secondaryText && this.props.secondaryText.length > 0;
  },

  getSecondaryTextIfAny: function() {
    if (this.hasSecondaryText()) {
      const secondaryText = this.props.secondaryText.map(body =>
        (<li key={body}>{body}</li>));

      return (
        <ul className="aui-connect-list-item-attributes">
          {secondaryText}
        </ul>
      );
    }
  },

  render: function() {
    return (
      <li className="aui-connect-list-item">
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

});

const TopicList = React.createClass({
  getLozengeClassNameForStatus: function(status) {
    let className = 'aui-lozenge ';
    if (status === 'OK') {
      className += 'aui-lozenge-success';
    } else if (status === 'INSUFFICIENT_DATA') {
      className += 'aui-lozenge-current';
    } else if (status === 'ALERT') {
      className += 'aui-lozenge-error';
    }

    return className;
  },

  render: function() {
    const topicList = this.props.topics.map(topic => (
      <ListItem
        key={topic.title}
        title={topic.title}
        actions={topic.actions}
        secondaryText={[
          <span className={this.getLozengeClassNameForStatus(topic.status)}>{topic.status}</span>,
          '#alerts: ' + topic.alerts.length
        ]}
      />));
    return (
      <section className="aui-connect-content with-list">
        <ol className="aui-connect-list">
          {topicList}
        </ol>
      </section>
    );
  }
});

const Sidebar = React.createClass({
  render: function() {
    return (
      <section className="aui-connect-page" role="main">
        <TopicList topics={topics} />
      </section>);
  }
});

const topics = [
  { title: 'Topic 1', alerts: [{}, {}], status: 'OK' },
  { title: 'Topic 2', alerts: [{}], actions: [{text: 'Test Action', href: '#'}], status: 'INSUFFICIENT_DATA' },
  { title: 'Topic 3', alerts: [{}, {}, {}], actions: [{text: 'Test Action', href: '#'}], status: 'ALERT' }
];

// Insert into DOM
ReactDOM.render(
  <Sidebar />,
  document.getElementById('content')
);
