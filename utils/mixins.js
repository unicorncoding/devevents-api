Array.prototype.ordered = function(comparator) {
  return this.sort(comparator);
}

String.prototype.normalizeSpaces = function() {
  return this.replace( /\s\s+/g, ' ' ).trim();
}