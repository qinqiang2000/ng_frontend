import React from 'react';

class Loader extends React.Component {
    constructor(props) {
        super(...arguments);
        this.state = {};
    }

    render() {
        return <div>loading ...</div>;
    }
}

export default Loader;
