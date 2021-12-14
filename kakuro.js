const { Constraint, CSP } = require('./csp')
const SAMPLE_PUZZLE = require('./The-Daily-Telegraph-4203.json')

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

const findAcrossRuns = puzzle => {
  return puzzle.acrossClues.map(([row, col, sum]) => {
    const variables = []
    for (; ;) {
      col += 1
      if (!isEmptySquare(puzzle, row, col)) break
      variables.push(makeVariable(row, col))
    }
    return { variables, sum }
  })
}

const findDownRuns = puzzle => {
  return puzzle.downClues.map(([row, col, sum]) => {
    const variables = []
    for (; ;) {
      row += 1
      if (!isEmptySquare(puzzle, row, col)) break
      variables.push(makeVariable(row, col))
    }
    return { variables, sum }
  })
}

const main = puzzle => {
  const acrossRuns = findAcrossRuns(puzzle)
  const downRuns = findDownRuns(puzzle)
  const allRuns = [].concat(acrossRuns, downRuns)
  const variables = Array.from(new Set(allRuns.flatMap(({ variables }) => variables)))
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
  let steps = 0
  const solution = csp.backtrackingSearch(_assignment => { steps++ })
  console.dir(solution)
  console.log('steps:', steps.toLocaleString())
}

main(SAMPLE_PUZZLE)
