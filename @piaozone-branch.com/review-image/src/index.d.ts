import React from 'react';

declare module '@piaozone.com/review-image' {
    export default class ReviewImage extends React.Component<any, any> {
        componentWillUnmount(): void;
        render: () => React.ReactElement;
    }
}