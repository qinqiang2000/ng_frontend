module.exports = (disableJsxRuntime) => {
    if (disableJsxRuntime) {
        return false;
    }
    try {
        require.resolve('react/jsx-runtime');
        return true;
    } catch (e) {
        return false;
    }
};