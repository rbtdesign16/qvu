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
import org.rbtdesign.qvu.dto.QuerySelectNode;
import org.rbtdesign.qvu.dto.Table;
import org.rbtdesign.qvu.dto.TableSettings;

/**
 *
 * @author rbtuc
 */
public class QuerySelectTreeBuilder {
    public static QuerySelectNode build(DatasourceSettingsHelper dsHelper, DataSourceConfiguration datasource, Set<String> userRoles, List<Table> tableInfo) {
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

                            cnt++;

                            fkMap.put(fk.getName(), cnt);
                            String toTable = fk.getToTableName();
                            boolean hide = false;
                            String key = fk.getToTableCacheKey();
                            TableSettings ts = dsHelper.getTableSettings(key);
                            if (userHasAccess(ts, userRoles)) {
                                if (ts != null) {
                                    if (StringUtils.isNotEmpty(ts.getDisplayName())) {
                                        toTable = ts.getDisplayName();
                                    }

                                    hide = ts.isHide();
                                }

                                if (!hide) {
                                    QuerySelectNode fkn = new QuerySelectNode();
                                    if (imported) {
                                        fkn.getMetadata().put("type", QuerySelectNode.NODE_TYPE_IMPORTED_FOREIGNKEY);
                                    } else {
                                        fkn.getMetadata().put("type", QuerySelectNode.NODE_TYPE_EXPORTED_FOREIGNKEY);
                                    }
                                    fkn.getMetadata().put("dbname", fk.getToTableName());
                                    fkn.setName(toTable);
                                    fkn.getMetadata().put("fkname", fk.getName());
                                    fkn.getMetadata().put("fromcols", fk.getColumns());
                                    fkn.getMetadata().put("tocols", fk.getToColumns());
                                    n.getChildren().add(fkn);

                                    Table fkt = tMap.get(key);

                                    List<String> fromdiscols = new ArrayList<>();
                                    List<String> todiscols = new ArrayList<>();

                                    for (int i = 0; i < fk.getColumns().size(); ++i) {
                                        String cname = fk.getColumns().get(i);
                                        String tocname = fk.getToColumns().get(i);
                                        ColumnSettings cs = dsHelper.getColumnSettings(t.getCacheKey() + "." + cname);

                                        if ((cs != null) && StringUtils.isNotEmpty(cs.getDisplayName())) {
                                            fromdiscols.add(cs.getDisplayName());
                                        } else {
                                            fromdiscols.add(cname);
                                        }

                                        cs = dsHelper.getColumnSettings(fkt.getCacheKey() + "." + tocname);

                                        if ((cs != null) && StringUtils.isNotEmpty(cs.getDisplayName())) {
                                            todiscols.add(cs.getDisplayName());
                                        } else {
                                            todiscols.add(tocname);
                                        }
                                    }

                                    fkn.getMetadata().put("fromdiscols", fromdiscols);
                                    fkn.getMetadata().put("todiscols", todiscols);

                                    loadColumns(fkn, ts, fkt, rootTable, userRoles);
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
