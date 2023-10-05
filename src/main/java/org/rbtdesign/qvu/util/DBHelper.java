package org.rbtdesign.qvu.util;

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
import java.util.StringTokenizer;
import org.apache.commons.lang3.SerializationUtils;
import org.apache.commons.lang3.StringUtils;
import org.rbtdesign.qvu.configuration.ConfigurationHelper;
import org.rbtdesign.qvu.configuration.database.DataSourceConfiguration;
import org.rbtdesign.qvu.dto.QueryDocumentRunWrapper;
import org.rbtdesign.qvu.dto.SqlFilterColumn;
import org.rbtdesign.qvu.dto.SqlFrom;
import org.rbtdesign.qvu.dto.SqlSelectColumn;
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
                || (type == java.sql.Types.BIT)
                || (type == java.sql.Types.SMALLINT)
                || (type == java.sql.Types.INTEGER)
                || (type == java.sql.Types.BIGINT)
                || (type == java.sql.Types.REAL)
                || (type == java.sql.Types.DOUBLE)
                || (type == java.sql.Types.NUMERIC)
                || (type == java.sql.Types.DECIMAL));
    }
    
    public boolean isDataTypeFloat(int type) {
        return ((type == java.sql.Types.REAL)
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
                        if (StringUtils.isNotEmpty(c.getAggregateFunction())) {
                            aggColumn = true;
                        } else {
                            nonAggColumn = true;
                        }
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
                } else if (StringUtils.isNotEmpty(c.getFromAlias())){
                    retval.append(" left outer join ");
                }   

                retval.append(getFromTableName(dbType, schema, c.getTable()));
                retval.append(" ");
                retval.append(withQuotes(dbType, c.getAlias()));

                if ((c.getToColumns() != null) && !c.getToColumns().isEmpty()) {
                    retval.append(" on (");

                    String and = "";
                    Set<String> hs = new HashSet<>();
                    
                    List <String> tcols = new ArrayList<>();
                    List <String> tcust = new ArrayList<>();
                    for (String col : c.getToColumns()) {
                        if (col.contains("=")) {
                            tcust.add(col);
                        } else {
                            tcols.add(col);
                        }
                    }
                    
                    for (int i = 0; i < tcols.size(); ++i) {
                        String toColumn = tcols.get(i);
                        String fromColumn = c.getFromColumns().get(i);

                        // sanity check to prevent duplicate columns
                        if (!hs.contains(fromColumn)) {
                            retval.append(and);
                            
                            retval.append(withQuotes(dbType, c.getAlias()));
                            retval.append(".");
                            retval.append(withQuotes(dbType, toColumn));

                            retval.append(" = ");

                            retval.append(withQuotes(dbType, c.getFromAlias()));
                            retval.append(".");
                            retval.append(withQuotes(dbType, fromColumn));
                            
                            and = " and ";
                            hs.add(fromColumn);
                        }
                    }

                    for (String col : tcust) {
                        int pos = col.indexOf(Constants.CUSTOM_FK_DATA_SEPARATOR);
                        retval.append(and);
                        retval.append(withQuotes(dbType, c.getAlias()));
                        retval.append(".");
                        retval.append(withQuotes(dbType, col.substring(0, pos)));
                        retval.append(" ");
                        retval.append(col.substring(pos + 1));
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
                    if (Constants.COMPARISON_OPERATOR_IN.equals(c.getComparisonOperator())) {
                        retval.append("(");
                        retval.append(addQuotesIfRequired(dbType, c, c.getComparisonValue(), indx));
                    } else {
                        retval.append(getComparisonValue(dbType, c, indx));
                    }
                    
                    
                    if (Constants.COMPARISON_OPERATOR_IN.equals(c.getComparisonOperator())) {
                        retval.append(")");
                    }
                    if (StringUtils.isEmpty(c.getComparisonValue())) {
                        indx++;
                    }
                }

                if (StringUtils.isNotEmpty(c.getCloseParenthesis())) {
                    retval.append(c.getCloseParenthesis());
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

        if (LOG.isDebugEnabled()) {
            LOG.debug("generated sql: " + retval.toString());
        }

        return retval.toString();
    }
    
    private String addQuotesIfRequired(String dbType, SqlFilterColumn c, String value, int indx) {
        String retval = value;
        
        if (isDataTypeString(c.getDataType())|| isDataTypeDateTime(c.getDataType())) {
            StringBuilder buf = new StringBuilder();
            String comma = "";
            StringTokenizer st = new StringTokenizer(value, ",");
            SqlFilterColumn ctmp = SerializationUtils.clone(c);
            while (st.hasMoreTokens()) {
                String token = st.nextToken().trim();
                buf.append(comma);
                
                 if (!token.startsWith("'")) {
                    ctmp.setComparisonValue(token);
                    buf.append(getComparisonValue(dbType, ctmp, indx));
                }
                
                comma = ",";
            }
            
            retval = buf.toString();
        }
                
        return retval;
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

};
