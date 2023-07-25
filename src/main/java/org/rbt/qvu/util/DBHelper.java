/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package org.rbt.qvu.util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.apache.commons.lang3.StringUtils;
import org.rbt.qvu.configuration.database.DataSourceConfiguration;
import org.rbt.qvu.dto.QueryRunWrapper;
import org.rbt.qvu.dto.SqlFilterColumn;
import org.rbt.qvu.dto.SqlFrom;
import org.rbt.qvu.dto.SqlSelectColumn;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 *
 * @author rbtuc
 */
public class DBHelper {
    private static final Logger LOG = LoggerFactory.getLogger(DBHelper.class);
    public static final String[] TABLE_TYPES = {"TABLE", "VIEW"};
    public static final String DB_TYPE_MYSQL = "MySQL";
    public static final String DB_TYPE_SQLSERVER = "Microsoft SQL Server";
    public static final String DB_TYPE_ORACLE = "Oracle";
    public static final String DB_TYPE_POSTGRES = "PostgreSQL";
    public static final String[] UNARY_OPERATORS = {"is not null", "is null"};
    public static final Set<String> UNARY_OPERATORS_SET = new HashSet<>();
    
    
    public static final String[] DATABASE_TYPES = {
        DBHelper.DB_TYPE_MYSQL,
        DBHelper.DB_TYPE_SQLSERVER,
        DBHelper.DB_TYPE_ORACLE,
        DBHelper.DB_TYPE_POSTGRES
    };
    
    
    static {
        UNARY_OPERATORS_SET.addAll(Arrays.asList(UNARY_OPERATORS));
    }
    
    
    public static boolean isDataTypeNumeric(int type) {
        return ((type == java.sql.Types.TINYINT)
            || (type == java.sql.Types.SMALLINT)
            || (type == java.sql.Types.INTEGER)
            || (type == java.sql.Types.BIGINT)
            || (type == java.sql.Types.REAL)
            || (type == java.sql.Types.DOUBLE)
            || (type == java.sql.Types.NUMERIC)
            || (type == java.sql.Types.DECIMAL));
    }

    public static boolean isDataTypeDateTime(int type) {
        return ((type == java.sql.Types.DATE)
            || (type == java.sql.Types.TIME)
            || (type == java.sql.Types.TIMESTAMP)
            || (type == java.sql.Types.TIME_WITH_TIMEZONE)
            || (type == java.sql.Types.TIMESTAMP_WITH_TIMEZONE));
    }


    public static boolean isDataTypeString(int type) {
        return ((type == java.sql.Types.CHAR)
            || (type == java.sql.Types.VARCHAR)
            || (type == java.sql.Types.LONGVARCHAR)
            || (type == java.sql.Types.CLOB)
            || (type == java.sql.Types.NCHAR)
            || (type == java.sql.Types.NVARCHAR)
            || (type == java.sql.Types.LONGNVARCHAR)
            || (type == java.sql.Types.NCLOB));
    }

    public static void closeConnection(Connection conn, Statement stmt, ResultSet res) {
        if (res != null) {
            try {
                res.close();
            } catch (Exception ex) {
            };
        }

        if (stmt != null) {
            try {
                stmt.close();
            } catch (Exception ex) {
            };
        }

        if (conn != null) {
            try {
                conn.close();
            } catch (Exception ex) {
            };
        }
    }

    public static Connection getConnection(DataSourceConfiguration datasource) throws Exception {
        return DriverManager.getConnection(datasource.getUrl(), datasource.getUsername(), datasource.getPassword());
    }

    public static String getSelect(QueryRunWrapper runWrapper) {
        StringBuilder retval = new StringBuilder();

        retval.append("select ");

        String comma = "";

        boolean aggColumn = false;
        boolean nonAggColumn = false;
        List<SqlSelectColumn> orderBy = new ArrayList<>();
        for (SqlSelectColumn c : runWrapper.getDocument().getSelectColumns()) {
            retval.append(comma);

            if (StringUtils.isNotEmpty(c.getCustomSql())) {
                retval.append(c.getCustomSql());
            } else {
                if (StringUtils.isNotEmpty(c.getAggregateFunction())) {
                    aggColumn = true;
                    retval.append(c.getAggregateFunction());
                    retval.append("(");
                } else {
                    nonAggColumn = true;
                }
                retval.append(c.getTableAlias());
                retval.append(".");
                retval.append(c.getColumnName());
                if (StringUtils.isNotEmpty(c.getAggregateFunction())) {
                    retval.append(")");
                }
            }

            comma = ", ";

            if (c.getSortPosition() > 0) {
                orderBy.add(c);
            }
        }

        retval.append(" from ");

        for (SqlFrom c : runWrapper.getDocument().getFromClause()) {
            if (StringUtils.isNotEmpty(c.getJoinType())) {
                if (Constants.OUTER_JOIN.equals(c.getJoinType())) {
                    retval.append(" left outer join ");
                } else {
                    retval.append(" join ");
                }
            }

            retval.append(c.getTable());
            retval.append(" ");
            retval.append(c.getAlias());
            retval.append(" on (");

            for (int i = 0; i < c.getToColumns().size(); ++i) {
                String toColumn = c.getToColumns().get(i);
                String fromColumn = c.getToColumns().get(i);

                retval.append(c.getAlias());
                retval.append(".");
                retval.append(toColumn);

                retval.append(" = ");

                retval.append(c.getFromAlias());
                retval.append(".");
                retval.append(fromColumn);
            }

            retval.append(")");
        }

        retval.append(" where ");
        int indx = 1;
        for (SqlFilterColumn c : runWrapper.getDocument().getFilterColumns()) {
            if (StringUtils.isNotEmpty(c.getAndOr())) {
                retval.append(" ");
                retval.append(c.getAndOr());
                retval.append(" ");
            }
            
            if (StringUtils.isNotEmpty(c.getOpenParenthesis())) {
                retval.append(c.getOpenParenthesis());
            }
            
            retval.append(c.getTableAlias());
            retval.append(".");
            retval.append(c.getColumnName());
            retval.append(" ");
            
            retval.append(c.getComparisonOperator());
            retval.append(" ");
            
            if (!UNARY_OPERATORS_SET.contains(c.getComparisonOperator())) {
                retval.append(getComparisonValue(c, indx));
                if (StringUtils.isEmpty(c.getComparisonValue())) {
                    indx++;
                }
            }
            
        }

        
        if (aggColumn && nonAggColumn) {
            retval.append(" group by ");
            comma = "";
            for (SqlSelectColumn c  : runWrapper.getDocument().getSelectColumns()) {
                if (StringUtils.isEmpty(c.getAggregateFunction())) {
                    retval.append(comma);
                    retval.append(c.getTableAlias());
                    retval.append(".");
                    retval.append(c.getColumnName());
                    comma = ", ";
                }
            }
        }
        
        if (!orderBy.isEmpty()) {
            Collections.sort(orderBy, new Comparator<SqlSelectColumn>() {
                @Override
                public int compare(SqlSelectColumn o1, SqlSelectColumn o2) {
                    return o1.getSortPosition() - o2.getSortPosition();
                }
            });
            
            comma = "";
            retval.append(" order by ");
            for (SqlSelectColumn c : orderBy) {
                retval.append(comma);
                retval.append(c.getTableAlias());
                retval.append(".");
                retval.append(c.getColumnName());
                retval.append(" ");
                
                if (StringUtils.isNotEmpty(c.getSortDirection())) {
                    retval.append(" ");
                    retval.append(c.getSortDirection());
                }
                
                comma = ",";
            }
        }
         
        
        LOG.debug("generated sql: " + retval.toString());
        
                
        return retval.toString();
    }

    public static String getComparisonValue(SqlFilterColumn c, int indx) {
        StringBuilder retval = new StringBuilder();
        if (StringUtils.isNotEmpty(c.getCustomSql())) {
            retval.append(c.getCustomSql());
        } else {
            if (isDataTypeString(c.getDataType())) {
                if (StringUtils.isEmpty(c.getComparisonValue())) {
                    retval.append(getDatabasePlaceholder(c.getDatasource(), indx));
                } else {
                    retval.append("'");
                    retval.append(c.getComparisonValue());
                    retval.append("'");
                }
            } else if (isDataTypeNumeric(c.getDataType())) {
                if (StringUtils.isEmpty(c.getComparisonValue())) {
                    retval.append(getDatabasePlaceholder(c.getDatasource(), indx));
                } else {
                    retval.append(c.getComparisonValue());
                }
            } else if (isDataTypeDateTime(c.getDataType())) {
                if (DB_TYPE_ORACLE.equals(c.getDatasource())) {
                    retval.append("TO_DATE(");
                    if (StringUtils.isEmpty(c.getComparisonValue())) {
                        retval.append(getDatabasePlaceholder(c.getDatasource(), indx));
                    } else {
                        retval.append("'");
                        retval.append(c.getComparisonValue());
                        retval.append("'");
                    }
                    retval.append(", 'YYYY-MM-DD')");
                } else {
                    if (StringUtils.isEmpty(c.getComparisonValue())) {
                        retval.append(getDatabasePlaceholder(c.getDatasource(), indx));
                    } else {
                        retval.append("'");
                        retval.append(c.getComparisonValue());
                        retval.append("'");
                    }
                }
            }
        }
        
        return retval.toString();
    }
    
    public static String getDatabasePlaceholder(String datasource, int indx) {
        String retval = null;
        switch(datasource) {
            case DB_TYPE_ORACLE:
            case DB_TYPE_MYSQL:
            case DB_TYPE_SQLSERVER:
                retval = "?";
                break;
            case DB_TYPE_POSTGRES:
                retval = "$" + indx;
                break;
            default:
                retval = "?";
                break;
        }
        
        return retval;
    }
}
