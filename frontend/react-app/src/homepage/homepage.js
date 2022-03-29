import React from 'react'

class HomePage extends React.Component {
  constructor(props) {
    super(props);
    this.clearAllIntervals()
    this.content = (
      <div>
        <h1>Homepage</h1>
        <p>Hello this is the homepage</p>
      </div>
    );
  }

  clearAllIntervals(){
    const interval_id = window.setInterval(function(){}, Number.MAX_SAFE_INTEGER);
    for (let i = 1; i < interval_id; i++) {
      window.clearInterval(i);
    }
  }

    render(){
      return this.content
    }
}

export { HomePage }
