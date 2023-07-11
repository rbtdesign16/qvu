/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package org.rbt.qvu.util;

import io.micrometer.common.util.StringUtils;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.rbt.qvu.dto.Column;
import org.rbt.qvu.dto.ColumnSettings;
import org.rbt.qvu.dto.ForeignKey;
import org.rbt.qvu.dto.QuerySelectNode;
import org.rbt.qvu.dto.Table;
import org.rbt.qvu.dto.TableSettings;

/**
 *
 * @author rbtuc
 */
public class QuerySelectTreeBuilder {
    public static QuerySelectNode build(DatasourceSettingsHelper dsHelper, String datasourceName, Set<String> userRoles, int maxImportedKeyDepth, int maxExportedKeyDepth, List<Table> tableInfo) {
        QuerySelectNode retval = new QuerySelectNode();
        retval.getMetadata().put("type", QuerySelectNode.NODE_TYPE_ROOT);
        Map<String, Table> tMap = new HashMap<>();
        for (Table t : tableInfo) {
            tMap.put(t.getCacheKey(), t);
        }
        
        int curDepth = 0;
        int indx = 0;
        for (Table t : tableInfo) {
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
                    Set<String> fkSet = new HashSet();
                    loadForeignKeys(n, dsHelper, datasourceName, tMap, userRoles, t, t.getImportedKeys(), true, maxImportedKeyDepth, curDepth, t.getName(), fkSet);
                    loadForeignKeys(n, dsHelper, datasourceName, tMap, userRoles, t, t.getExportedKeys(), false, maxExportedKeyDepth, curDepth, t.getName(), fkSet);
                }
            }
        }

        Integer[] idHolder = {1};
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
                        cn.getMetadata().put("pk", true);
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
            Set<String> fkSet) {
        if (curDepth <= maxDepth) {
            if (fkList != null) {
                for (ForeignKey fk : fkList) {
                    // do this to prevent circular relationships
                    if (!fkSet.contains(fk.getName())) {
                        fkSet.add(fk.getName());
                        String toTable = fk.getToTableName();
                        boolean hide = false;
                        String key = datasourceName + "." + toTable;
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
                                        loadForeignKeys(fkn, dsHelper, datasourceName, tMap, userRoles, fkt, fkt.getImportedKeys(), imported, maxDepth, curDepth + 1, rootTable, fkSet);
                                    } else {
                                        loadForeignKeys(fkn, dsHelper, datasourceName, tMap, userRoles, fkt, fkt.getExportedKeys(), imported, maxDepth, curDepth + 1, rootTable, fkSet);
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