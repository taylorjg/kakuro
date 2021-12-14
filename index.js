class Constraint {

  constructor(variables) {
    this.variables = variables
  }

  satisfied(_assignment) {
    throw new Error('Constraint#satisfied must be overridden')
  }
}

class CSP {

  constructor(variables, domains) {
    this.variables = variables
    this.domains = domains
    this.constraints = new Map()
    for (const variable of this.variables) {
      if (!this.domains.has(variable)) {
        throw new Error(`variable ${variable} not in domain map`)
      }
      this.constraints.set(variable, [])
    }
  }

  addConstraint(constraint) {
    for (const variable of constraint.variables) {
      if (!this.variables.includes(variable)) {
        throw new Error(`constraint variable ${variable} not in CSP`)
      }
      this.constraints.get(variable).push(constraint)
    }
  }

  consistent(variable, assignment) {
    for (const constraint of this.constraints.get(variable)) {
      if (!constraint.satisfied(assignment)) {
        return false
      }
    }
    return true
  }

  backtrackingSearch(assignment = new Map()) {

    if (assignment.size === this.variables.length) {
      return assignment
    }

    const unassigned = this.variables.filter(variable => !assignment.has(variable))
    const first = unassigned[0]
    for (const value of this.domains.get(first)) {
      const localAssignment = new Map(assignment)
      localAssignment.set(first, value)
      if (this.consistent(first, localAssignment)) {
        const result = this.backtrackingSearch(localAssignment)
        if (result) {
          return result
        }
      }
    }
    return null
  }
}

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
