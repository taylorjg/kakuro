class Constraint {

  constructor(variables) {
    this.variables = variables
  }

  satisfied(_assignment) {
    throw new Error('Constraint#satisfied must be overridden')
  }
}

const firstUnassigned = (unassigned, _domains) => {
  return unassigned[0]
}

const minimumRemainingValues = (unassigned, domains) => {
  let leastLen = Number.MAX_SAFE_INTEGER
  let leastLenVariable
  for (const v of unassigned) {
    const len = domains.get(v).length
    if (len < leastLen) {
      leastLen = len
      leastLenVariable = v
      if (leastLen === 1) break
    }
  }
  console.log('leastLenVariable:', leastLenVariable)
  return leastLenVariable
}

const forwardChecking = (constraints, domains, variable, value, assignment) => {
  const v1 = constraints.get(variable).flatMap(constraint => constraint.variables)
  const v2 = v1.filter(v => v !== variable && !assignment.has(v))
  const v3 = new Set(v2)
  const domains2 = new Map(domains)
  for (const v of v3) {
    const dvs = domains2.get(v)
    const dvs2 = dvs.filter(dv => dv !== value)
    domains2.set(v, dvs2)
  }
  return domains2
}

class CSP {

  constructor(variables, domains, selectUnassignedVariable) {
    this.variables = variables
    this.domains = domains
    this.selectUnassignedVariable = selectUnassignedVariable ?? firstUnassigned
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

  backtrackingSearch(cb, assignment = new Map(), domains = this.domains) {

    if (assignment.size === this.variables.length) {
      return assignment
    }

    const unassigned = this.variables.filter(variable => !assignment.has(variable))
    const chosenVariable = this.selectUnassignedVariable(unassigned, domains)

    for (const value of domains.get(chosenVariable)) {
      const localAssignment = new Map(assignment)
      localAssignment.set(chosenVariable, value)
      cb?.(localAssignment)
      if (this.consistent(chosenVariable, localAssignment)) {
        const localDomains = forwardChecking(this.constraints, domains, chosenVariable, value, localAssignment)
        const result = this.backtrackingSearch(cb, localAssignment, localDomains)
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
