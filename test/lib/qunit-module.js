// Re-exports QUnit as a module
console.log('QUnit module loading, QUnit is:', window.QUnit);
const QUnit = window.QUnit;
if (!QUnit) {
    throw new Error('QUnit not found in global scope');
}
export default QUnit;

// Export common QUnit functions
export const {
    module,
    test,
    assert,
    todo,
    skip,
    only
} = QUnit;

// Add a helper to start QUnit after all modules are loaded
export function start() {
    // Give a small delay to ensure all modules are loaded
    setTimeout(() => QUnit.start(), 0);
}
