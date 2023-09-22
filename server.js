const express = require('express');
const body = require('body-parser');
const fs = require('fs');
const e = require('express');
const app = express();
// const querystring = require('querystring');
const url = require('url');
const findRes = require('./modules/find')
const fileName = 'folfix-cpy'
port = 3653

//Set
app.set('port', process.env.port || port)
app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.use(body.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));


app.get('/', (req, res) => {
    fs.readFile('./'+fileName+'.json', 'utf8', (err, cpy) => {
        let q = JSON.parse(cpy)
        res.render('list', {
            showList: q
        })
    })
})

app.get('/add', (req, res) => {
    let qe = url.parse(req.url, true).query
    let code = qe.code, ref = qe.ref, ward = qe.ward, name = qe.name, brand = qe.brand, model = qe.model, sn = qe.sn, caldate = qe.caldate
    if (code === undefined) {
        fs.readFile('./'+fileName+'.json', 'utf8', (err, cpy) => {
            let q = JSON.parse(cpy)
            res.render('add', {
                list: q,
                title: "เพิ่มข้อมูล"
            })
        })
    }
    else {
        let date = new Date()
        let mo = date.getMonth() + 1
        if (caldate === "pass") {
            caldate = date.getFullYear() + "-" + mo + "-" + date.getDate()
        }
        let data = {
            "code": code,
            "ref": ref,
            "ward": ward,
            "name": name,
            "brand": brand,
            "model": model,
            "sn": sn,
            "caldate": caldate,
            "lastupdate": "เปลี่ยนแปลงข้อมูลล่าสุด: " + date.getDate() + "-" + mo + "-" + date.getFullYear() + " เวลา " + date.getHours() + ":" + date.getMinutes() + " น."
        }

        fs.readFile('./'+fileName+'.json', 'utf8', (err, cpy) => {
            let q = JSON.parse(cpy)
            q.push(data)
            fs.writeFile('./'+fileName+'.json', JSON.stringify(q, null, 4), (err) => {
                if (err) throw err;
                console.log('Added!');
                res.render('saved', {
                    code: code
                })
            })
        })
    }



})

app.get('/print', (req, res) => {
    let qe = url.parse(req.url, true).query
    let dates = qe.dates
    let d = dates.split(" - ")
    let dStart = d[0], dEnd = d[1]
    let d1 = dStart.split("-"), d2 = dEnd.split("-")
    console.log("Printing "+dStart + "-" + dEnd);
    let dbug = d1[0] - 1
    d1 = d1[2] + "-" + d1[1] + "-" + dbug, d2 = d2[2] + "-" + d2[1] + "-" + d2[0]
    fs.readFile('./'+fileName+'.json', 'utf8', (err, cpy) => {
        if (err) {
            res.end("Can't read data file", err);
        } else {
            let data = JSON.parse(cpy)
            //ฟังก์ชั่นค้นหา
            let result = data.filter(x => Date.parse(x.caldate) >= Date.parse(d1) - 1 && Date.parse(x.caldate) <= Date.parse(d2) + 1)
            //แสดงผล
            res.render('print', {
                showList: result,
                startDate: dStart,
                endDate: dEnd,
                summ:result.length,
                title: "Print report " + dStart + " to " + dEnd
            })
        }
    })
})

app.get('/show', (req, res) => {
    let qe = url.parse(req.url, true).query
    let ward = qe.ward, t = qe.type, c = qe.txtSearch
    console.log("Ward = " + ward + " Code = " + c + " Type =" + t);
    if (ward !== undefined && c === undefined && t === undefined) {
        fs.readFile('./'+fileName+'.json', 'utf8', (err, cpy) => {
            if (err) {
                res.end("Can't read data file", err);
            } else {
                let data = JSON.parse(cpy)
                //ฟังก์ชั่นค้นหา
                let result = data.filter(x => x.ward === ward)
                //แสดงผล
                res.render('list', {
                    showList: result,
                    title: "List by Ward"
                })
            }
        })
    } else if (ward === undefined && c !== undefined && t === undefined) {
        fs.readFile('./'+fileName+'.json', 'utf8', (err, cpy) => {
            if (err) {
                res.end("Can't read data file", err);
            } else {
                let data = JSON.parse(cpy)


                //แสดงผล+ส่งข้อมูล
                let result = findRes(data, c)
                if (result === undefined) {
                    result = [

                    ]
                    res.render('list', {
                        showList: result,
                        title: "Search Result"
                    })
                } else {
                    result = [result]
                    res.render('list', {
                        showList: result,
                        title: "Search Result"

                    })
                }

            }
        })
    } else if (ward === undefined && c === undefined && t !== undefined) {
        fs.readFile('./'+fileName+'.json', 'utf8', (err, cpy) => {
            if (err) {
                res.end("Can't read data file", err);
            } else {
                let data = JSON.parse(cpy)
                //ฟังก์ชั่นค้นหา
                let result = data.filter(x => x.name === t)
                //แสดงผล
                res.render('list', {
                    showList: result,
                    title: "List by Type"
                })
            }
        })
    } else {
        res.render('404')
    }
})

app.get('/edit', (req, res) => {
    let qe = url.parse(req.url, true).query
    let code = qe.code, ref = qe.ref, ward = qe.ward, name = qe.name, brand = qe.brand, model = qe.model, sn = qe.sn, caldate = qe.caldate
    if (ref === undefined) {
        console.log("Edit at : " + code);
        fs.readFile('./'+fileName+'.json', 'utf8', (err, cpy) => {
            let data = JSON.parse(cpy)
            let result = data.filter(x => x.code === code)
            res.render('edit', {
                title: "Edit at Code : " + code,
                code: result
            })
        })
    } else {
        fs.readFile('./'+fileName+'.json', 'utf8', (err, cpy) => {
            if (err) throw err;
            let date = new Date()
            let mo = date.getMonth() + 1
            let data = JSON.parse(cpy)
            if (caldate === "pass") {
                caldate = date.getFullYear() + "-" + mo + "-" + date.getDate()
            }
            let x = data.map(item => {
                if (item.code === code) {
                    return Object.assign({}, item, {
                        "code": code,
                        "ref": ref,
                        "ward": ward,
                        "name": name,
                        "brand": brand,
                        "model": model,
                        "sn": sn,
                        "caldate": caldate,
                        "lastupdate": "เปลี่ยนแปลงข้อมูลล่าสุด: " + date.getDate() + "-" + mo + "-" + date.getFullYear() + " เวลา " + date.getHours() + ":" + date.getMinutes() + " น."
                    })
                }
                return item
            })

            fs.writeFile('./'+fileName+'.json', JSON.stringify(x, null, 4), (err) => {
                if (err) throw err;
                console.log('Updated!');
                res.render('saved', {
                    code: code
                })
            })

        })

    }


})

app.get('*', (req, res) => { //เมื่อไม่พบข้อมูล
    res.render('404')
})

app.get('/api/cpy', (req, res) => {
    fs.readFile('./'+fileName+'.json', 'utf8', (err, cpy) => {
        if (err) {
            console.log("Can't read", err);
            return
        }
        res.send(cpy)
    })
});

//API Code
app.get('/api/cpy/:code', (req, res) => {
    fs.readFile('./'+fileName+'.json', 'utf8', (err, cpy) => {
        if (err) {
            res.end("Can't read data file", err);
        } else {
            let code = req.params.code
            let data = JSON.parse(cpy)

            //แสดงผล+ส่งข้อมูล
            let result = findRes(data, code)
            if (result === undefined) {
                res.end("No Item!")
            } else {
                res.send(JSON.stringify(result))
                res.end("OK")
            }

        }
    })
});

//================Run Server=========================
app.listen(port, () => {
    console.log('Server listen on port', port);
})
