const { Constraint, CSP } = require('./csp')
const SAMPLE_PUZZLE = require('./The-Daily-Telegraph-4203.json')

const sum = xs => xs.reduce((a, b) => a + b, 0)
const flatten = xss => [].concat(...xss)

const makeVariable = (row, col) => `${row}:${col}`

class KakuroConstraint extends Constraint {

  constructor(variables, sum) {
    super(variables)
    this.sum = sum
  }

  satisfied(assignment) {
    const values = this.variables.flatMap(variable =>
      assignment.has(variable) ? [assignment.get(variable)] : [])
    const set = new Set(values)
    if (set.size < values.length) {
      return false
    }
    const sumOfValues = sum(values)
    if (values.length === this.variables.length) {
      if (sumOfValues !== this.sum) {
        return false
      }
    } else {
      if (sumOfValues >= this.sum) {
        return false
      }
    }
    return true
  }
}

const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9]

const isEmptySquare = (puzzle, row, col) => (
  row >= 0 && row < puzzle.gridShape.length &&
  col >= 0 && col < puzzle.gridShape[0].length &&
  puzzle.gridShape[row][col] === '.'
)

const findRuns = (puzzle, clues, rowIncrement, colIncrement) => {
  return clues.map(([row, col, sum]) => {
    const variables = []
    for (; ;) {
      row += rowIncrement
      col += colIncrement
      if (!isEmptySquare(puzzle, row, col)) break
      variables.push(makeVariable(row, col))
    }
    const tuples = Array.from(findRunDigits(variables.length, sum))
    const digits = Array.from(new Set(flatten(tuples))).sort((a, b) => a - b)
    return { variables, sum, tuples, digits }
  })
}

const findAcrossRuns = puzzle => findRuns(puzzle, puzzle.acrossClues, 0, 1)
const findDownRuns = puzzle => findRuns(puzzle, puzzle.downClues, 1, 0)

const digitsWithout = ds => DIGITS.filter(d => !ds.includes(d))

function* findRunDigits(n, requiredTotal) {

  function* helper(n, useds = [], array = []) {
    const remainingDigits = digitsWithout(flatten(useds))
    const used = []
    useds.push(used)
    for (const digit of remainingDigits) {
      array.push(digit)
      used.push(digit)
      if (n > 1) {
        yield* helper(n - 1, useds, array)
      } else {
        if (sum(array) === requiredTotal) {
          yield array.slice()
        }
      }
      array.pop()
    }
    useds.pop()
  }

  yield* helper(n)
}

const makeDomain = (variable, allRuns) => {
  const runs = allRuns.filter(run => run.variables.includes(variable))
  const digits = Array.from(new Set(runs.flatMap(run => run.digits)))
  return digits
}

const main = puzzle => {
  const acrossRuns = findAcrossRuns(puzzle)
  const downRuns = findDownRuns(puzzle)
  const allRuns = flatten([acrossRuns, downRuns])
  const variables = Array.from(new Set(allRuns.flatMap(({ variables }) => variables)))
  const domains = new Map(variables.map(variable => [variable, makeDomain(variable, allRuns)]))
  const csp = new CSP(variables, domains)
  const acrossConstraints = acrossRuns.map(({ variables, sum }) => new KakuroConstraint(variables, sum))
  for (const constraint of acrossConstraints) {
    csp.addConstraint(constraint)
  }
  const downConstraints = downRuns.map(({ variables, sum }) => new KakuroConstraint(variables, sum))
  for (const constraint of downConstraints) {
    csp.addConstraint(constraint)
  }
  let steps = 0
  const solution = csp.backtrackingSearch(_assignment => { steps++ })
  console.dir(solution)
  console.log('steps:', steps.toLocaleString())
}

main(SAMPLE_PUZZLE)
