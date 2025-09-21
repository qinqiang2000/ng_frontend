import Layout from '$components/layout/';
import Index from '$routes/index';
import { PAGE_PRE_PATH, PUBLIC_PAGE_PRE_PATH } from '../constants';
export const routes = [{
    name: 'IndexPage',
    path: PUBLIC_PAGE_PRE_PATH + '/',
    Component: Index
}, {
    name: 'IndexPage',
    path: PAGE_PRE_PATH + '/layout',
    Component: Index,
    Layout
}];

