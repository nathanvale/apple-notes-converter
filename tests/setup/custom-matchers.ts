import { toHaveNoViolations } from 'jest-axe'

// Extend Vitest's expect with jest-axe matchers
expect.extend(toHaveNoViolations)
