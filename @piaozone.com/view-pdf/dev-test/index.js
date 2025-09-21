import React from 'react';
import ReactDOM from 'react-dom';
import MyCom from '../src';
const src = document.location.search;
ReactDOM.render((
    <MyCom
        filename='test002.pdf'
        //src='https://api-sit.piaozone.com/doc/free/fileInfo/preview/f12660873076631470088569210856.pdf'
        src='https://api-sit.piaozone.com/doc/free/fileInfo/preview/nf1294595804495175680.pdf'
        cMapUrl='https://img.piaozone.com/static/gallery/pdfjs-doc/web/pdfjs/cmaps/'
        cMapPacked={true}
        useOnlyCssZoom={false}
        renderInteractiveForms={true}
        pdfWorkUrl='https://img.piaozone.com/static/gallery/pdfViewJs/2x/pdf.worker.js'
    />
), document.getElementById('root'));