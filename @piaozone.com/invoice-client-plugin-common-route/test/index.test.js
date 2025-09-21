import { sum } from '../src/index';

describe('Sum Tests', function () {
    it('两数相加', function () {
		expect(sum()).toEqual(0);
        expect(sum(1, 2)).toEqual(3);
    });
});