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

  backtrackingSearch(cb, assignment = new Map()) {

    if (assignment.size === this.variables.length) {
      return assignment
    }

    const unassigned = this.variables.filter(variable => !assignment.has(variable))
    const first = unassigned[0]
    for (const value of this.domains.get(first)) {
      const localAssignment = new Map(assignment)
      localAssignment.set(first, value)
      cb?.(localAssignment)
      if (this.consistent(first, localAssignment)) {
        const result = this.backtrackingSearch(cb, localAssignment)
        if (result) {
          return result
        }
      }
    }
    return null
  }
}

module.exports = {
  Constraint,
  CSP
}
