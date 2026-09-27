/**
 * Field-level validation utilities
 */

export function validateEmail(value) {
  if (!value) return 'Email is required'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email address'
  return null
}

export function validatePhone(value) {
  if (!value) return 'Phone number is required'
  if (!/^\+?[\d\s\-()]{10,15}$/.test(value)) return 'Enter a valid phone number (10–15 digits)'
  return null
}

export function validateAge(value) {
  const age = Number(value)
  if (!value) return 'Age is required'
  if (isNaN(age) || age < 1 || age > 120) return 'Age must be between 1 and 120'
  return null
}

export function validateClaimAmount(value) {
  const amt = Number(value)
  if (!value) return 'Claim amount is required'
  if (isNaN(amt) || amt <= 0) return 'Claim amount must be greater than 0'
  return null
}

export function validateRequired(value, label = 'This field') {
  if (!value || value.toString().trim() === '') return `${label} is required`
  return null
}

export function validateFile(file, { maxSize = 5_000_000, allowedTypes = [] } = {}) {
  if (!file) return null
  if (file.size > maxSize)
    return `File size must not exceed ${(maxSize / 1_000_000).toFixed(0)}MB`
  if (allowedTypes.length && !allowedTypes.some(t => file.type.startsWith(t.replace('*', ''))))
    return `Allowed types: ${allowedTypes.join(', ')}`
  return null
}

/**
 * Validate a full step of the claim form.
 * Returns { isValid, errors }
 */
export function validateStep(step, formData) {
  const errors = {}

  if (step === 1) {
    const e1 = validateRequired(formData.customerName, 'Customer name')
    if (e1) errors.customerName = e1
    const e2 = validateEmail(formData.email)
    if (e2) errors.email = e2
    const e3 = validatePhone(formData.phone)
    if (e3) errors.phone = e3
    const e4 = validateAge(formData.age)
    if (e4) errors.age = e4
    const e5 = validateRequired(formData.gender, 'Gender')
    if (e5) errors.gender = e5
  }

  if (step === 2) {
    const fields = ['policyNumber', 'policyStartDate', 'policyExpiryDate', 'claimType']
    fields.forEach(f => {
      const e = validateRequired(formData[f], f)
      if (e) errors[f] = e
    })
    const ea = validateClaimAmount(formData.claimAmount)
    if (ea) errors.claimAmount = ea
    if (formData.policyStartDate && formData.policyExpiryDate) {
      if (new Date(formData.policyExpiryDate) <= new Date(formData.policyStartDate))
        errors.policyExpiryDate = 'Expiry must be after start date'
    }
  }

  if (step === 3) {
    const required3 = ['incidentDate', 'incidentLocation', 'description']
    required3.forEach(f => {
      const e = validateRequired(formData[f], f)
      if (e) errors[f] = e
    })
    if (formData.incidentDate && new Date(formData.incidentDate) > new Date())
      errors.incidentDate = 'Incident date cannot be in the future'
    if (formData.claimType === 'Medical' && !formData.hospitalName)
      errors.hospitalName = 'Hospital name is required for medical claims'
    if (formData.claimType === 'Vehicle' && !formData.vehicleNumber)
      errors.vehicleNumber = 'Vehicle number is required for vehicle claims'
  }

  if (step === 4) {
    if (!formData.documents?.insurance)
      errors.insurance = 'Insurance document is required'
    const docFields = ['medicalBill', 'fir', 'insurance']
    docFields.forEach(key => {
      const file = formData.documents?.[key]
      if (file) {
        const e = validateFile(file, { maxSize: 5_000_000, allowedTypes: ['application/pdf', 'image/'] })
        if (e) errors[key] = e
      }
    })
  }

  return { isValid: Object.keys(errors).length === 0, errors }
}
