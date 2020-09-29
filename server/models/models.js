const { Pool } = require('pg');

const PG_URI = 'postgres://btjgfcxo:Ef1KIX6U1ZgoujBfY2hp823hMJL3fk6f@lallah.db.elephantsql.com:5432/btjgfcxo';

const pool = new Pool({
    connectionString: PG_URI,
});

module.exports = {
    query: (text, params, callback) => {
        return pool.query(text, params, callback);
    },
}