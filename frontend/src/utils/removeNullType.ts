export default function removeNullType<T>(any: T): NonNullable<T> {
    if (any === null || any === undefined)
        throw new Error("argument is null or undefined")
    return any
}