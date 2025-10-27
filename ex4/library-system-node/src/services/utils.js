export async function withTimeout(promise, timeoutMs, operationName = 'Operacja') {
    const timeoutPromise = new Promise((resolve, reject) => {
        setTimeout(() => {
            reject(new Error(`${operationName}: Przekroczono limit czasu ${timeoutMs}ms`));
        }, timeoutMs);
    });

    return Promise.race([promise, timeoutPromise]);
}