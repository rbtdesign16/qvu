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
import org.rbt.qvu.configuration.ConfigurationHelper;
import org.rbt.qvu.configuration.database.DataSourceConfiguration;
import org.rbt.qvu.dto.QueryDocumentRunWrapper;
import org.rbt.qvu.dto.QueryParameter;
import org.rbt.qvu.dto.SqlFilterColumn;
import org.rbt.qvu.dto.SqlFrom;
import org.rbt.qvu.dto.SqlSelectColumn;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 *
 * @author rbtuc
 */
@Component
public class DBHelper {
    private static final Logger LOG = LoggerFactory.getLogger(DBHelper.class);
    public static final String[] TABLE_TYPES = {"TABLE", "VIEW"};
    public static final String DB_TYPE_MYSQL = "MySQL";
    public static final String DB_TYPE_SQLSERVER = "Microsoft SQL Server";
    public static final String DB_TYPE_ORACLE = "Oracle";
    public static final String DB_TYPE_POSTGRES = "PostgreSQL";
    public static final String[] UNARY_OPERATORS = {"is not null", "is null"};
    public static final Set<String> UNARY_OPERATORS_SET = new HashSet<>();
    public static final int DEFAULT_NUMBER_DISPLAY_COLUMN_WIDTH = 8;
    public static final int DEFAULT_DATETIME_DISPLAY_COLUMN_WIDTH = 18;
    public static final int DEFAULT_STRING_DISPLAY_COLUMN_WIDTH = 50;
    public static final int DEFAULT_MAX_DISPLAY_COLUMN_WIDTH = 200;
    public static final int DEFAULT_DISPLAY_COLUMN_WIDTH = 50;

    public static final String[] DATABASE_TYPES = {
        DBHelper.DB_TYPE_MYSQL,
        DBHelper.DB_TYPE_SQLSERVER,
        DBHelper.DB_TYPE_ORACLE,
        DBHelper.DB_TYPE_POSTGRES
    };

    static {
        UNARY_OPERATORS_SET.addAll(Arrays.asList(UNARY_OPERATORS));
    }

    @Autowired
    private ConfigurationHelper config;

    public boolean isDataTypeNumeric(int type) {
        return ((type == java.sql.Types.TINYINT)
                || (type == java.sql.Types.SMALLINT)
                || (type == java.sql.Types.INTEGER)
                || (type == java.sql.Types.BIGINT)
                || (type == java.sql.Types.REAL)
                || (type == java.sql.Types.DOUBLE)
                || (type == java.sql.Types.NUMERIC)
                || (type == java.sql.Types.DECIMAL));
    }

    public boolean isDataTypeDateTime(int type) {
        return ((type == java.sql.Types.DATE)
                || (type == java.sql.Types.TIME)
                || (type == java.sql.Types.TIMESTAMP)
                || (type == java.sql.Types.TIME_WITH_TIMEZONE)
                || (type == java.sql.Types.TIMESTAMP_WITH_TIMEZONE));
    }

    public boolean isDataTypeString(int type) {
        return ((type == java.sql.Types.CHAR)
                || (type == java.sql.Types.VARCHAR)
                || (type == java.sql.Types.LONGVARCHAR)
                || (type == java.sql.Types.CLOB)
                || (type == java.sql.Types.NCHAR)
                || (type == java.sql.Types.NVARCHAR)
                || (type == java.sql.Types.LONGNVARCHAR)
                || (type == java.sql.Types.NCLOB));
    }

    public void closeConnection(Connection conn, Statement stmt, ResultSet res) {
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

    public Connection getConnection(DataSourceConfiguration datasource) throws Exception {
        return DriverManager.getConnection(datasource.getUrl(), datasource.getUsername(), datasource.getPassword());
    }

    public String withQuotes(String dbType, String input) {
        StringBuilder retval = new StringBuilder();

        retval.append(getQuotedIdentifier(dbType));
        retval.append(input);
        retval.append(getQuotedIdentifier(dbType));

        return retval.toString();
    }

    private String getFromTableName(String dbType, String schema, String tableName) {
        if (isSchemaRequired(dbType)) {
            return withQuotes(dbType, schema) + "." + withQuotes(dbType, tableName);
        } else {
            return withQuotes(dbType, tableName);
        }
    }
    
    public String getSelect(QueryDocumentRunWrapper runWrapper) {
        StringBuilder retval = new StringBuilder();

        retval.append("select ");

        String comma = "";

        DataSourceConfiguration dsconfig = config.getDatasourcesConfig().getDatasourceConfiguration(runWrapper.getDocument().getDatasource());

        if (dsconfig != null) {
            String dbType = dsconfig.getDatabaseType();
            boolean aggColumn = false;
            boolean nonAggColumn = false;
            List<SqlSelectColumn> orderBy = new ArrayList<>();
            for (SqlSelectColumn c : runWrapper.getDocument().getSelectColumns()) {
                if (c.isShowInResults()) {
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
                        retval.append(withQuotes(dbType, c.getTableAlias()));
                        retval.append(".");
                        retval.append(withQuotes(dbType, c.getColumnName()));
                        if (StringUtils.isNotEmpty(c.getAggregateFunction())) {
                            retval.append(")");
                        }
                    }

                    comma = ", ";

                    if (StringUtils.isNotEmpty(c.getDisplayName()) 
                            && !c.getDisplayName().equals(c.getColumnName())) {
                        retval.append(" as ");
                        retval.append(withQuotes(dbType, c.getDisplayName()));
                    }

                    if (c.getSortPosition() > 0) {
                        orderBy.add(c);
                    }
                }
            }

            retval.append(" from ");

            String schema = dsconfig.getSchema();
            for (SqlFrom c : runWrapper.getDocument().getFromClause()) {
                if (StringUtils.isNotEmpty(c.getJoinType())) {
                    if (Constants.OUTER_JOIN.equals(c.getJoinType())) {
                        retval.append(" left outer join ");
                    } else {
                        retval.append(" join ");
                    }
                }

                retval.append(getFromTableName(dbType, schema, c.getTable()));
                retval.append(" ");
                retval.append(withQuotes(dbType, c.getAlias()));

                if ((c.getToColumns() != null) && !c.getToColumns().isEmpty()) {
                    retval.append(" on (");

                    for (int i = 0; i < c.getToColumns().size(); ++i) {
                        String toColumn = c.getToColumns().get(i);
                        String fromColumn = c.getFromColumns().get(i);

                        retval.append(withQuotes(dbType, c.getAlias()));
                        retval.append(".");
                        retval.append(withQuotes(dbType, toColumn));

                        retval.append(" = ");

                        retval.append(withQuotes(dbType, c.getFromAlias()));
                        retval.append(".");
                        retval.append(withQuotes(dbType, fromColumn));
                    }

                    retval.append(")");
                }
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

                retval.append(withQuotes(dbType, c.getTableAlias()));
                retval.append(".");
                retval.append(withQuotes(dbType, c.getColumnName()));
                retval.append(" ");

                retval.append(c.getComparisonOperator());
                retval.append(" ");

                if (!UNARY_OPERATORS_SET.contains(c.getComparisonOperator())) {
                    retval.append(getComparisonValue(dbType, c, indx));
                    if (StringUtils.isEmpty(c.getComparisonValue())) {
                        indx++;
                    }
                }

            }

            if (aggColumn && nonAggColumn) {
                retval.append(" group by ");
                comma = "";
                for (SqlSelectColumn c : runWrapper.getDocument().getSelectColumns()) {
                    if (StringUtils.isEmpty(c.getAggregateFunction())) {
                        retval.append(comma);
                        retval.append(withQuotes(dbType, c.getTableAlias()));
                        retval.append(".");
                        retval.append(withQuotes(dbType, c.getColumnName()));
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
                    retval.append(withQuotes(dbType, c.getTableAlias()));
                    retval.append(".");
                    retval.append(withQuotes(dbType, c.getColumnName()));
                    retval.append(" ");

                    if (StringUtils.isNotEmpty(c.getSortDirection())) {
                        retval.append(" ");
                        retval.append(c.getSortDirection());
                    }

                    comma = ",";
                }
            }
        }

        LOG.debug("generated sql: " + retval.toString());

        return retval.toString();
    }

    public String getComparisonValue(String dbType, SqlFilterColumn c, int indx) {
        StringBuilder retval = new StringBuilder();
        if (StringUtils.isNotEmpty(c.getCustomSql())) {
            retval.append(c.getCustomSql());
        } else {
            if (isDataTypeString(c.getDataType())) {
                if (StringUtils.isEmpty(c.getComparisonValue())) {
                    retval.append(getDatabasePlaceholder(dbType, indx));
                } else {
                    retval.append("'");
                    retval.append(c.getComparisonValue());
                    retval.append("'");
                }
            } else if (isDataTypeNumeric(c.getDataType())) {
                if (StringUtils.isEmpty(c.getComparisonValue())) {
                    retval.append(getDatabasePlaceholder(dbType, indx));
                } else {
                    retval.append(c.getComparisonValue());
                }
            } else if (isDataTypeDateTime(c.getDataType())) {
                if (DB_TYPE_ORACLE.equals(dbType)) {
                    retval.append("TO_DATE(");
                    if (StringUtils.isEmpty(c.getComparisonValue())) {
                        retval.append(getDatabasePlaceholder(dbType, indx));
                    } else {
                        retval.append("'");
                        retval.append(c.getComparisonValue());
                        retval.append("'");
                    }
                    retval.append(", 'YYYY-MM-DD')");
                } else {
                    if (StringUtils.isEmpty(c.getComparisonValue())) {
                        retval.append(getDatabasePlaceholder(dbType, indx));
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

    public boolean isSchemaRequired(String dbType) {
        boolean retval = false;
        switch (dbType) {
            case DB_TYPE_ORACLE:
            case DB_TYPE_MYSQL:
            case DB_TYPE_POSTGRES:
                retval = false;
            case DB_TYPE_SQLSERVER:
                retval = true;
                break;
        }

        return retval;
    }

    public String getDatabasePlaceholder(String dbType, int indx) {
        String retval = null;
        switch (dbType) {
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

    public String getQuotedIdentifier(String dbType) {
        switch (dbType) {
            case DB_TYPE_MYSQL:
                return "`";
            case DB_TYPE_SQLSERVER:
            case DB_TYPE_ORACLE:
            case DB_TYPE_POSTGRES:
                return "\"";
            default:
                return "\"";
        }
    }

    public int getJdbcTypeFromName(String name) {
        int retval;
        switch(name) {
            case QueryParameter.DATE_TYPE:
                retval = java.sql.Types.DATE;
                break;
            case QueryParameter.FLOAT_TYPE:
                retval = java.sql.Types.DOUBLE;
               break;
            case QueryParameter.INTEGER_TYPE:
                retval = java.sql.Types.INTEGER;
                break;
           case QueryParameter.TIME_TYPE:
                retval = java.sql.Types.TIME;
                break;
            case QueryParameter.BOOLEAN_TYPE:
                retval = java.sql.Types.BOOLEAN;
                break;
             case QueryParameter.TIMESTAMP_TYPE:
                retval = java.sql.Types.TIMESTAMP;
                break;
            default:
                retval = java.sql.Types.VARCHAR;
                break;
        }
        
        return retval;
    }
};
