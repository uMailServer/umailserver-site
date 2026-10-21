// Product status and source snapshot, checked against upstream on 22 October 2026.
// Unreleased changes are not a published binary release.
export const productRepo = 'https://github.com/uMailServer/uMailServer';
export const productRevision = 'a3e6809f96003ef9dcd3aea1ef2277bc1461201b';
export const productCheckedOn = '22 October 2026';
export const productStatus = 'v0.1.0 beta';
export const sourceCheckout = `git clone ${productRepo}.git\ncd uMailServer\ngit checkout ${productRevision}`;
