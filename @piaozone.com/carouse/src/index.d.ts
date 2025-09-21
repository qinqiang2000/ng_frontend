import React from 'react';

declare module '@piaozone.com/carouse' {
    export default class PwyCarouse extends React.Component<any, any> {
        componentWillUnmount(): void;
        render: () => React.ReactElement;
    }
}