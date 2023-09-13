/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package org.rbtdesign.qvu.util;

import io.micrometer.common.util.StringUtils;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.rbtdesign.qvu.configuration.database.DataSourceConfiguration;
import org.rbtdesign.qvu.dto.Column;
import org.rbtdesign.qvu.dto.ColumnSettings;
import org.rbtdesign.qvu.dto.ForeignKey;
import org.rbtdesign.qvu.dto.ForeignKeySettings;
import org.rbtdesign.qvu.dto.QuerySelectNode;
import org.rbtdesign.qvu.dto.Table;
import org.rbtdesign.qvu.dto.TableSettings;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 *
 * @author rbtuc
 */
public class QuerySelectTreeBuilder {
    private static final Logger LOG = LoggerFactory.getLogger(QuerySelectTreeBuilder.class);

    public static QuerySelectNode build(FileHandler fileHandler, DatasourceSettingsHelper dsHelper, DataSourceConfiguration datasource, Set<String> userRoles, List<Table> tableInfo) {
        QuerySelectNode retval = new QuerySelectNode();
        retval.getMetadata().put("type", QuerySelectNode.NODE_TYPE_ROOT);

        Map<String, Table> tMap = new HashMap<>();
        for (Table t : tableInfo) {
            tMap.put(t.getCacheKey(), t);
        }

        int curDepth = 0;
        for (Table t : tableInfo) {
            String datasourceName = datasource.getDatasourceName();
            String key = datasourceName + "." + t.getName();
            TableSettings ta = dsHelper.getTableSettings(key);

            if (userHasAccess(ta, userRoles)) {
                QuerySelectNode n = new QuerySelectNode();
                n.getMetadata().put("type", QuerySelectNode.NODE_TYPE_TABLE);
                n.getMetadata().put("dbname", t.getName());
                String tName = t.getName();
                boolean hide = false;
                if (ta != null) {
                    if (StringUtils.isNotEmpty(ta.getDisplayName())) {
                        tName = ta.getDisplayName();
                    }

                    hide = ta.isHide();
                }

                n.setName(tName);

                if (!hide) {
                    retval.getChildren().add(n);
                    loadColumns(n, ta, t, t.getName(), userRoles);
                    Map<String, Integer> fkMap = new HashMap<>();
                    loadForeignKeys(n, dsHelper, datasourceName, tMap, userRoles, t, t.getImportedKeys(), true, datasource.getMaxImportedKeyDepth(), curDepth, t.getName(), fkMap);
                    loadForeignKeys(n, dsHelper, datasourceName, tMap, userRoles, t, t.getExportedKeys(), false, datasource.getMaxExportedKeyDepth(), curDepth, t.getName(), fkMap);
                }
            }
        }

        Integer[] idHolder = {0};
        setIds(retval, idHolder);

        if (LOG.isTraceEnabled()) {
            LOG.trace("QuerySelectTree: " + fileHandler.getGson().toJson(retval, QuerySelectNode.class));
        }

        return retval;
    }

    private static void setIds(QuerySelectNode n, Integer[] idHolder) {
        n.setId(idHolder[0]++);

        if (n.getChildren() != null) {
            for (QuerySelectNode c : n.getChildren()) {
                setIds(c, idHolder);
            }
        }

    }

    private static boolean userHasAccess(TableSettings ts, Set<String> userRoles) {
        boolean retval = true;

        if ((ts != null) && (ts.getRoles() != null) && !ts.getRoles().isEmpty()) {
            Set<String> tset = new HashSet<>(ts.getRoles());
            tset.retainAll(userRoles);
            retval = !tset.isEmpty();
        }

        return retval;
    }

    private static boolean userHasAccess(ColumnSettings cs, Set<String> userRoles) {
        boolean retval = true;

        if ((cs != null) && (cs.getRoles() != null) && !cs.getRoles().isEmpty()) {
            Set<String> cset = new HashSet<>(cs.getRoles());

            cset.retainAll(userRoles);

            retval = !cset.isEmpty();
        }

        return retval;
    }

    private static void loadColumns(QuerySelectNode n, TableSettings ta, Table t, String rootTable, Set<String> userRoles) {
        Map<String, ColumnSettings> csMap = new HashMap<>();

        if ((ta != null) && (ta.getTableColumnSettings() != null)) {
            for (ColumnSettings cs : ta.getTableColumnSettings()) {
                csMap.put(cs.getCacheKey(), cs);
            }
        }

        for (Column c : t.getColumns()) {

            String cname = c.getName();
            boolean hide = false;
            ColumnSettings cs = csMap.get(c.getCacheKey());
            if (userHasAccess(cs, userRoles)) {
                if (cs != null) {
                    if (StringUtils.isNotEmpty(cs.getDisplayName())) {
                        cname = cs.getDisplayName();
                    }

                    hide = cs.isHide();
                }

                if (!hide) {
                    QuerySelectNode cn = new QuerySelectNode();
                    cn.getMetadata().put("roottable", rootTable);
                    cn.getMetadata().put("type", QuerySelectNode.NODE_TYPE_COLUMN);
                    cn.getMetadata().put("dbname", c.getName());
                    if (c.getPkIndex() > 0) {
                        cn.getMetadata().put("pkindex", c.getPkIndex());
                    }

                    cn.setName(cname);

                    cn.getMetadata().put("datatype", c.getDataType());
                    cn.getMetadata().put("datatypename", c.getTypeName());

                    n.getChildren().add(cn);
                }
            }
        }
    }

    private static String buildForeignKeyColumnString(ForeignKey fk) {
        StringBuilder retval = new StringBuilder();

        String comma = "";
        Set<String> hs = new HashSet<>();
        
        List<String> tcols = new ArrayList<>();
        List<String> tcust = new ArrayList<>();
         
        for (String c : fk.getToColumns()) {
            if (!c.contains(Constants.CUSTOM_FK_DATA_SEPARATOR)) {
                tcols.add(c);
            } else {
                tcust.add(c);
            }
        }

        for (int i = 0; i < fk.getColumns().size(); i++) {
            String c = fk.getColumns().get(i);
            if (!hs.contains(c)) {
                retval.append(comma);
                retval.append(fk.getColumns().get(i));
                retval.append("->");
                retval.append(tcols.get(i));
                comma = ",";
                hs.add(c);
            }
        }
        
        for (String c : tcust) {
            retval.append(comma);
            int pos = c.indexOf(Constants.CUSTOM_FK_DATA_SEPARATOR);
            retval.append(fk.getToTableName());
            retval.append(".");
            retval.append(c.substring(0, pos));
            retval.append(" ");
            retval.append(c.substring(pos + 1));
        }

        return retval.toString();
    }
    
    private static void loadForeignKeys(QuerySelectNode n,
            DatasourceSettingsHelper dsHelper,
            String datasourceName,
            Map<String, Table> tMap,
            Set<String> userRoles,
            Table t,
            List<ForeignKey> fkList,
            boolean imported,
            int maxDepth,
            int curDepth,
            String rootTable,
            Map<String, Integer> fkMap) {
        if (curDepth <= maxDepth) {
            if (fkList != null) {
                TableSettings tsFrom = dsHelper.getTableSettings(t.getCacheKey());

                for (ForeignKey fk : fkList) {
                    if (tMap.containsKey(fk.getTableCacheKey())
                            && tMap.containsKey(fk.getToTableCacheKey())) {
                        // using this to prevent circular references 
                        Integer cnt = fkMap.get(fk.getName());
                        // do this to prevent circular relationships
                        if ((cnt == null) || (cnt == 1)) {
                            if (cnt == null) {
                                cnt = 0;
                            }

                            String toTable = fk.getToTableName();
                            
                            boolean hide = false;
                            TableSettings tsTo = dsHelper.getTableSettings(fk.getToTableCacheKey());
                            if (userHasAccess(tsTo, userRoles)) {
                                if (tsTo != null) {
                                    hide = tsTo.isHide();

                                    if (!hide) {
                                        if (StringUtils.isNotEmpty(tsTo.getDisplayName())) {
                                            toTable = tsTo.getDisplayName();
                                        }
                                    }
                                }

                                if (!hide) {
                                    String fkDisplayName = null;
                                    if (tsFrom != null) {
                                        // see if we have a foreign key display name configured
                                        for (ForeignKeySettings fks : tsFrom.getForeignKeySettings()) {
                                            if (fk.getName().equals(fks.getForeignKeyName())) {
                                                fkDisplayName = fks.getDisplayName();
                                                break;
                                            }
                                        }
                                    }
 
                                    QuerySelectNode fkn = new QuerySelectNode();
                                    if (imported) {
                                        fkn.getMetadata().put("type", QuerySelectNode.NODE_TYPE_IMPORTED_FOREIGNKEY);
                                    } else {
                                        fkn.getMetadata().put("type", QuerySelectNode.NODE_TYPE_EXPORTED_FOREIGNKEY);
                                    }
                                    fkn.getMetadata().put("dbname", fk.getToTableName());
                                   
                                    String baseName = toTable;
                                    
                                    if (fk.isCustom()) {
                                        baseName = fk.getName();
                                    }
                                    
                                    fkn.getMetadata().put("fkname", fk.getName());
                                    if (StringUtils.isNotEmpty(fkDisplayName)) {
                                        fkn.setName(fkDisplayName.replace("$t", toTable).replace("$c", buildForeignKeyColumnString(fk)));
                                    } else {
                                        fkn.setName(baseName  + ": " + buildForeignKeyColumnString(fk));
                                    }

                                    fkMap.put(fk.getName(), ++cnt);

                                    fkn.getMetadata().put("fromcols", fk.getColumns());
                                    fkn.getMetadata().put("tocols", fk.getToColumns());
                                    n.getChildren().add(fkn);

                                    List<String> fromdiscols = new ArrayList<>();
                                    List<String> todiscols = new ArrayList<>();

                                    Table fkt = tMap.get(fk.getToTableCacheKey());
                                    for (int i = 0; i < fk.getColumns().size(); ++i) {
                                        String cname = fk.getColumns().get(i);
                                        String tocname = fk.getToColumns().get(i);
                                        ColumnSettings cs = dsHelper.getColumnSettings(t.getCacheKey() + "." + cname);

                                        String nm;
                                        if ((cs != null) && StringUtils.isNotEmpty(cs.getDisplayName())) {
                                            nm = cs.getDisplayName();
                                        } else {
                                            nm = cname;
                                        }

                                        if (!fromdiscols.contains(nm)) {
                                            fromdiscols.add(nm);
                                        }

                                        cs = dsHelper.getColumnSettings(t.getCacheKey() + "." + tocname);

                                        if ((cs != null) && StringUtils.isNotEmpty(cs.getDisplayName())) {
                                            nm = cs.getDisplayName();
                                        } else {
                                            nm = tocname;
                                        }

                                        // sanity check to prevent duplicate columns
                                        if (!todiscols.contains(nm)) {
                                            todiscols.add(nm);
                                        }
                                    }

                                    fkn.getMetadata().put("fromdiscols", fromdiscols);
                                    fkn.getMetadata().put("todiscols", todiscols);

                                    loadColumns(fkn, tsTo, fkt, rootTable, userRoles);
                                    if (curDepth < maxDepth) {
                                        if (imported) {
                                            loadForeignKeys(fkn, dsHelper, datasourceName, tMap, userRoles, fkt, fkt.getImportedKeys(), imported, maxDepth, curDepth + 1, rootTable, fkMap);
                                        } else {
                                            loadForeignKeys(fkn, dsHelper, datasourceName, tMap, userRoles, fkt, fkt.getExportedKeys(), imported, maxDepth, curDepth + 1, rootTable, fkMap);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

}
