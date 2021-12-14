const { Constraint, CSP } = require('./csp')

class QueensConstraint extends Constraint {

  constructor(columns) {
    super(columns)
    this.columns = columns
  }

  satisfied(assignment) {
    for (const [q1c, q1r] of assignment) {
      for (const q2c of this.columns.filter(c => c > q1c)) {
        if (assignment.has(q2c)) {
          const q2r = assignment.get(q2c)
          if (q1r === q2r) {
            return false
          }
          if (Math.abs(q1r - q2r) === Math.abs(q1c - q2c)) {
            return false
          }
        }
      }
    }
    return true
  }
}

const main = () => {
  const columns = [1, 2, 3, 4, 5, 6, 7, 8]
  const rows = new Map()
  for (const column of columns) {
    rows.set(column, [1, 2, 3, 4, 5, 6, 7, 8])
  }
  const csp = new CSP(columns, rows)
  csp.addConstraint(new QueensConstraint(columns))
  const solution = csp.backtrackingSearch()
  console.dir(solution)
}

main()
