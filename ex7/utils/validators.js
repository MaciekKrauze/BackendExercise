function validateIsbn(isbn) {
    if (isbn != null) {
        if (!isNaN(isbn)) {
            const str = String(isbn);
            if (str.length === 13) {
                return { valid: true, error: "" };
            }
            return { valid: false, error: "bad length" };
        }
        return { valid: false, error: "not a number" };
    }
    return { valid: false, error: "isbn is null" };
}

function validateYear(year) {
    if (year != null) {
        if (!isNaN(year)) {
            const num = Number(year);
            if (num > 1000 && num <= new Date().getFullYear()) {
                return { valid: true, error: "" };
            }
            return { valid: false, error: "bad year range" };
        }
        return { valid: false, error: "not a number" };
    }
    return { valid: false, error: "year is null" };
}

function validatePositiveNumber(value) {
    if (value != null) {
        if (!isNaN(value)) {
            const num = Number(value);
            if (num > 0) {
                return { valid: true, error: "" };
            }
            return { valid: false, error: "negative value" };
        }
        return { valid: false, error: "not a number" };
    }
    return { valid: false, error: "value is null" };
}

function validateRequiredString(value) {
    if (value != null) {
        if (typeof value === "string") {
            if (value.trim().length > 0) {
                return { valid: true, error: "" };
            }
            return { valid: false, error: "empty string" };
        }
        return { valid: false, error: "not a string" };
    }
    return { valid: false, error: "value is null" };
}

module.exports =  {
    validateIsbn,
    validateYear,
    validatePositiveNumber,
    validateRequiredString
}
