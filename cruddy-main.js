var mysql = require('mysql'),
    utility = require('./cruddy-utility'),
    sqlConstants = require('./cruddy-constants'),
    env = require('../environment.json');

module.exports = {
    Select : function(table, values, constraints, callback){
        var sql = `${sqlConstants.Select} ${values.join(',')} ${sqlConstants.From} ${table}`;

        if(utility.IsValid(constraints)){
            var constraintArray = [];
            var values = [];
            for (var key in constraints){
                constraintArray.push(`${key} = ?`);
                values.push(constraints[key]);
            }

            if(constraintArray.length > 0){
                sql += ` ${sqlConstants.Where} ${constraintArray.join(` ${sqlConstants.And} `)}`;
                sql = mysql.format(sql, values);
            }
        }
        
        sql += ';';

        try{
            GetConnection(function(connection){
                connection.query(sql, function(exception, results){
                    connection.end();
                    callback(CreateSqlResponse(exception 
                        ? false : true, exception, results));
                });
            });
        }catch(exception){
            callback(CreateSqlResponse(false, exception));
        }
    },
    Insert : function(table, values, columns, callback){
        var valueArray = [];
        for(var i = 0; i < columns.length; i++){
            valueArray.push('?');
        }

        var sql = `${sqlConstants.Insert} ${sqlConstants.Into} ${table} (${columns.join(',')}) ${sqlConstants.Values} (${valueArray.join(',')});`;
        sql = mysql.format(sql, values);
        try{
            GetConnection(function(connection){
                connection.query(sql, function(exception){
                    connection.end();
                    callback(CreateSqlResponse(!exception, exception));
                });
            });
        }catch(exception){
            callback(false, exception);
        }
    },
    Delete : function(table, constraints, callback){
        var sql = `${sqlConstants.Delete} ${sqlConstants.From} ${table} ${sqlConstants.Where}`;
        
        var constraintArray = [];
        var values = [];
        for (var key in constraints){
            constraintArray.push(`${key} = ?`);
            values.push(constraints[key]);
        }

        if(constraintArray.length > 0){
            sql += ` ${constraintArray.join(` ${sqlConstants.And} `)}`;
            sql = mysql.format(sql, values);
        }

        try{
            GetConnection(function(connection){
                connection.query(sql, function(exception){
                    connection.end();
                    callback(CreateSqlResponse(!exception, exception));
                });
            });
        }catch(exception){
            callback(false, exception);
        }
    },
    Update : function(table, sets, constraints, callback){
        var sql = `${sqlConstants.Update} ${table} ${sqlConstants.Set}`;
        
        var setArray = [];
        var values = [];
        
        for(var key in sets){
            setArray.push(`${key} = ?`);
            values.push(sets[key]);
        }

        sql += ` ${setArray.join(',')} `

        if(utility.IsValid(constraints)){
            var constraintArray = [];
            for (var key in constraints){
                constraintArray.push(`${key} = ?`);
                values.push(constraints[key]);
            }   

            sql += ` ${sqlConstants.Where} ${constraintArray.join(sqlConstants.And)}`
        }

        sql = mysql.format(sql, values);
        try{
            GetConnection(function(connection){
                connection.query(sql, function(exception){
                    connection.end();
                    callback(CreateSqlResponse(!exception, exception));
                });
            });
        }catch(exception){
            callback(false, exception);
        }
    }
}

function GetConnection(callback){

    var connection = mysql.createConnection({
            host : env.url,
            user : env.user,
            password : env.password,
            database : env.database
    });
    
    connection.connect(function(exception){
        if(exception){
            throw exception;
        }
    });

    callback(connection);
}

function CreateSqlResponse(success, exceptions, results){
    return {
        success : success,
        exceptions : exceptions,
        results : results
    }
}