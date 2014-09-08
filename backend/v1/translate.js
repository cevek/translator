module.exports = function (app) {
    return function* (req, res, next, resume) {
        if (req.method == 'GET') {
            var words = req.query.words.split(",");
            var rows = yield app.db.query("SELECT id,def FROM words WHERE id IN (?)", [words], resume);
            var list = {};
            for (var i = 0; i < rows.length; i++) {
                var row = rows[i];
                list[row.id] = row.def;
            }
            res.send(list);
        }
    }.toFn();
};