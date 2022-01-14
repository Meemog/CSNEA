import React from 'react'

class HomePage extends React.Component {
  constructor(props) {
    super(props);
    this.content = (
      <div>
        <p>Hello this is the homepage</p>
      </div>
    );
  }

    render(){
      return this.content
    }
}

export { HomePage }
