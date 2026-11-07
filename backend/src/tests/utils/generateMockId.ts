export default function generateMockId(idArr: number[]) {
    let i = 0;
    while (idArr.includes(i)) {
        if (typeof idArr[i] != "number")
            throw new Error("Must be an array of integers")
        i += 1
    }
    return i
}