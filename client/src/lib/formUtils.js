export const getFieldError = (errors, field) => {
    if (!errors) return null;
    const error = errors[field];
    if (Array.isArray(error)) return error[0];
    return error || null;
};

// ponytail: O(n) scan over fields, enough for form sizes; no schema lib needed.
export const validateRequired = (values, fields) => {
    const errors = {};
    for (const { name, label } of fields) {
        const value = values?.[name];
        if (value === undefined || value === null || String(value).trim() === '') {
            errors[name] = `${label || name} is required.`;
        }
    }
    return errors;
};
