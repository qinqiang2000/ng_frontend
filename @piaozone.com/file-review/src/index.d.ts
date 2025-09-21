import React from 'react';

declare module '@piaozone.com/file-review' {
    export default class FileReview extends React.Component<any, any> {
        componentWillUnmount(): void;
        render: () => React.ReactElement;
    }
}