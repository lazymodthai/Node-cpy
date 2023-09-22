module.exports = findRes = (myRes, code) => {
    const index = myRes.findIndex((item, index) => {
        return item.code === code.toUpperCase() || item.sn === code.toUpperCase() || item.code === "CHC-" + code || item.ref === code.toUpperCase() || item.code === code.replace(/\s/g, '').toUpperCase()
    })
    return myRes[index]
}