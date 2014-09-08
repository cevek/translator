var rest = require("cevek-rest");
module.exports = function (app) {
    return function* (req, res, next, resume) {
        if (req.method == 'GET') {
            var apiKey = 'dict.1.1.20140908T100648Z.c5f54b811d1abea7.83b3781a8cc0bd932ae7ad6a4ff12428371c76a6';

            function* translate(word, callback, resume) {
                console.log(word);

                var url = 'https://dictionary.yandex.net/api/v1/dicservice.json/lookup?key=' + apiKey + '&lang=en-ru&text=' + word;
                var data = yield rest.get(url, null, resume);
                var t = {};
                try {
                    for (var i = 0; i < data.def.length; i++) {
                        var def = data.def[i];
                        var tr = def.tr.shift();
                        if (tr)
                            t[def.pos] = tr.text;
                        if (!t.def)
                            t.def = tr.text;
                    }
                    t.status = 1;
                }
                catch (e) {
                    console.error(e);
                }
                yield app.db.query("UPDATE words SET ? WHERE id=?", [t, word], resume);
                callback();
            }

            var rows = yield app.db.query("SELECT id FROM words WHERE status=0", resume);
            for (var i = 0; i < rows.length; i++) {
                var row = rows[i];
                yield translate.run(row.id, resume);
            }


            res.send("ok");
        }
    }.toFn();
};