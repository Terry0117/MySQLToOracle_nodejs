let mysql = require('mysql');
let oracledb = require('oracledb');

let currentMonth = new Date().toISOString().substring(0,7).replace('-','')
let month = '';

//若有參數日期則使用參數日期，無則使用當月
if (process.argv[2] && process.argv[2].length===6){           //第一個參數是否存在
    month = process.argv[2]
}
else {
    month = currentMonth
}

console.log(month);

let config =
{
    user: '',  //使用者名稱
    password: '',  //密碼
    //IP:資料庫IP地址，PORT:資料庫埠，SCHEMA:資料庫名稱
    connectString: ""
};
function doRelease(connection)
{
  connection.close(
    function (err) {
      if (err) {
          console.error(err.message);
      }
    }
  );
}

let conn = mysql.createConnection({
    host: '',
    port: 3307,
    user: '',
    password: '',
    database: ''
});

let MYSQL_query = `select * from scm.rpa_kpi_v where mth = '${month}'`

conn.connect();
conn.query(MYSQL_query,
    (err,rows)=>{
        if(err) throw err;
        // console.log(rows);
        oracledb.getConnection(
            config,
            async function (err, connection)
              {
                if (err) {
                  console.error(err.message);
                  res.send(err);
                  return;
                }
                let deleteQuery = `delete rpa_kpi where mth = '${month}'`;
                console.log(deleteQuery)
                await connection.execute(deleteQuery)

                let query = `insert into rpa_kpi(fid, mth, "KPI_Value", "KPI_avghours")values(`
                let insertQuery = '';
                rows.forEach(async (data,index)=>{
                    insertQuery = `${query}'${data.id}','${data.mth}',${data.ttl_cnt},${data.avg_kpi_value})`
                    console.log(insertQuery)
                    await connection.execute(insertQuery)
                    // console.log(index);
                    // console.log('id:',data.id);
                    // console.log('mth:',data.mth);
                    // console.log('ttl_cnt:',data.ttl_cnt);
                    // console.log('avg_kpi_value:',data.avg_kpi_value);
                })
                await connection.execute(`commit`)
                doRelease(connection);
              })
    }
    );
conn.end();
