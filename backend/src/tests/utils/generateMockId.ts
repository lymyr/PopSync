export default function generateMockId(idArr: number[]) {
    let i = 0;
    while (idArr.includes(i)) {
        i += 1
    }
    return i
}