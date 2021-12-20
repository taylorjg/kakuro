const sum = xs => xs.reduce((a, b) => a + b, 0)
const flatten = xss => [].concat(...xss)

module.exports = {
  sum,
  flatten
}
