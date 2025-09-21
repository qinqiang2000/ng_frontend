import React from 'react';

declare module '@piaozone.com/scan-image' {
    export default class ScanImage extends React.Component<any, any> {
        componentWillUnmount(): void;
        render: () => React.ReactElement;
    }
}