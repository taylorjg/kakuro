const { Constraint, CSP } = require('./csp')

const sum = xs => xs.reduce((a, b) => a + b, 0)

const makeVariable = (row, col) => `${row}:${col}`

class KakuroConstraint extends Constraint {

  constructor(variables, sum) {
    super(variables)
    this.sum = sum
  }

  satisfied(assignment) {
    const values = this.variables.flatMap(variable =>
      assignment.has(variable) ? [assignment.get(variable)] : [])
    const set = new Set([values])
    if (set.size !== values.length) {
      return false
    }
    const sumOfValues = sum(values)
    if (values.length === this.variables.length) {
      if (sumOfValues !== this.sum) {
        return false
      }
    } else {
      if (sumOfValues > this.sum) {
        return false
      }
    }
    return true
  }
}

// No 4203
const GRID_SHAPE = [
  'XXXXXXXXXX',
  'XX..X..X..',
  'X...X.....',
  'X....X...X',
  'X..X....XX',
  'X..X...X..',
  'XXX....X..',
  'XX...X....',
  'X.....X...',
  'X..X..X..X',
]

// [row, col, sum]
const ACROSS_CLUES = [
  [1, 1, 16],
  [1, 4, 9],
  [1, 7, 16],
  [2, 0, 7],
  [2, 4, 35],
  [3, 0, 29],
  [3, 5, 24],
  [4, 0, 3],
  [4, 5, 21],
  [5, 0, 4],
  [5, 3, 17],
  [5, 7, 7],
  [6, 2, 11],
  [6, 7, 17],
  [7, 1, 21],
  [7, 5, 12],
  [8, 0, 25],
  [8, 6, 9],
  [9, 0, 4],
  [9, 3, 4],
  [9, 6, 4]
]

// [row, col, sum]
const DOWN_CLUES = [
  [0, 2, 19],
  [0, 3, 18],
  [0, 5, 14],
  [0, 6, 35],
  [0, 8, 22],
  [0, 9, 17],
  [1, 1, 15],
  [1, 7, 24],
  [2, 4, 31],
  [3, 5, 11],
  [4, 8, 26],
  [4, 9, 16],
  [5, 3, 9],
  [6, 2, 17],
  [6, 7, 6],
  [7, 1, 7],
  [7, 5, 8]
]

const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9]

// [ { variables: ['row:col', 'row:col', ...], sum: number } ]
const findAcrossRuns = () => {
  return []
}

// [ { variables: ['row:col', 'row:col', ...], sum: number } ]
const findDownRuns = () => {
  return []
}

const main = () => {
  const acrossRuns = findAcrossRuns()
  const downRuns = findDownRuns()
  const variables = Array.from(new Set(acrossRuns.concat[downRuns].flatMap(({ variables }) => variables)))
  const domains = new Map(variables.map(variable => [variable, DIGITS]))
  const csp = new CSP(variables, domains)
  const acrossConstraints = acrossRuns.map(({ variables, sum }) => new KakuroConstraint(variables, sum))
  for (const constraint of acrossConstraints) {
    csp.addConstraint(constraint)
  }
  const downConstraints = downRuns.map(({ variables, sum }) => new KakuroConstraint(variables, sum))
  for (const constraint of downConstraints) {
    csp.addConstraint(constraint)
  }
  const solution = csp.backtrackingSearch()
  console.dir(solution)
}

main()
