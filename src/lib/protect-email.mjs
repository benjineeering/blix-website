/**
 * Keeps email addresses out of the HTML source so address-harvesting bots
 * don't find them. The address is stored reversed + base64-encoded in a
 * data attribute; a small script in Base.astro turns it back into a normal
 * mailto link in the visitor's browser. Without JavaScript the visitor sees
 * "name [at] domain".
 */
export function encodeEmail(address) {
  return btoa([...address].reverse().join(''));
}

export function obfuscatedLabel(address) {
  return address.replace('@', ' [at] ');
}

/** Attributes for a protected link: <a href="#" data-mail="…">. */
export function protectedLinkAttributes(href) {
  const address = href.replace(/^mailto:/i, '').split('?')[0];
  return { href: '#', 'data-mail': encodeEmail(address), address };
}
