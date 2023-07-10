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
        retval.setType(QuerySelectNode.NODE_TYPE_ROOT);
        Map<String, Table> tMap = new HashMap<>();
        for (Table t : tableInfo) {
            tMap.put(t.getCacheKey(), t);
        }
        for (Table t : tableInfo) {
            QuerySelectNode n = new QuerySelectNode();
            n.setType(QuerySelectNode.NODE_TYPE_TABLE);
            n.setDbName(t.getName());

            String key = datasourceName + "." + t.getName();
            TableSettings ta = dsHelper.getTableSettings(key);

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
                loadColumns(n, ta, t);
                Set<String> fkSet = new HashSet();
                loadForeignKeys(n, dsHelper, datasourceName, tMap, t, t.getImportedKeys(), QuerySelectNode.NODE_TYPE_IMPORTED_FOREIGNKEY, maxImportedKeyDepth, 1, fkSet);
                loadForeignKeys(n, dsHelper,  datasourceName, tMap, t, t.getExportedKeys(), QuerySelectNode.NODE_TYPE_EXPORTED_FOREIGNKEY, maxExportedKeyDepth, 1, fkSet);
            }
        }
        
        return retval;
    }

    private static void loadColumns(QuerySelectNode n, TableSettings ta, Table t) {
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

            if (cs != null) {
                if (StringUtils.isNotEmpty(cs.getDisplayName())) {
                    cname = cs.getDisplayName();
                }

                hide = cs.isHide();
            }

            if (!hide) {
                QuerySelectNode cn = new QuerySelectNode();
           //     cn.setParent(n.getId());
            //    cn.setId(currentId++);
                cn.setType(QuerySelectNode.NODE_TYPE_COLUMN);
                cn.setDbName(c.getName());
                cn.setName(cname);

                Map<String, Object> info = cn.getAdditionalInfo();
                info.put("type", c.getDataType());
                info.put("typename", c.getTypeName());

                n.getChildren().add(cn);
            }
        }

    }

    private static void loadForeignKeys(QuerySelectNode n, DatasourceSettingsHelper dsHelper, String datasourceName, Map<String, Table> tMap, Table t, List<ForeignKey> fkList, String nodeType, int maxDepth, int curDepth, Set<String> fkSet) {
        if (curDepth < maxDepth) {
            if (fkList != null) {
                
                for (ForeignKey fk : fkList) {
                    // do this to prevent circular relationships
                    if (!fkSet.contains(fk.getName()))  {
                        fkSet.add(fk.getName());
                        String toTable = fk.getToTableName();
                        boolean hide = false;
                        String key = datasourceName + "." + toTable;
                        TableSettings ts = dsHelper.getTableSettings(key);

                        if (ts != null) {
                            if (StringUtils.isNotEmpty(ts.getDisplayName())) {
                                toTable = ts.getDisplayName();
                            }

                            hide = ts.isHide();
                        }

                        if (!hide) {
                            QuerySelectNode fkn = new QuerySelectNode();
                  //          fkn.setId(currentId++);
                  //          fkn.setParent(n.getId());
                            fkn.setType(nodeType);
                            fkn.setDbName(fk.getToTableName());
                            fkn.setName(toTable);

                            Map<String, Object> info = fkn.getAdditionalInfo();
                            info.put("fkname", fk.getName());

                            List<String[]> columns = new ArrayList<>();
                            for (int i = 0; i < fk.getColumns().size(); ++i) {
                                String fromColumn = fk.getColumns().get(i);
                                String toColumn = fk.getToColumns().get(i);
                                columns.add(new String[]{fromColumn, toColumn});
                            }

                            info.put("columns", columns);

                            n.getChildren().add(fkn);

                            Table fkt = tMap.get(key);

                            loadColumns(fkn, ts, fkt);
                            if (QuerySelectNode.NODE_TYPE_IMPORTED_FOREIGNKEY.equals(nodeType)) {
                                loadForeignKeys(fkn, dsHelper, datasourceName, tMap, fkt, fkt.getImportedKeys(), nodeType, maxDepth, curDepth + 1, fkSet);
                            } else {
                                loadForeignKeys(fkn, dsHelper, datasourceName, tMap, fkt, fkt.getExportedKeys(), nodeType, maxDepth, curDepth + 1, fkSet);
                            }
                        }
                    }
                }
            }
        }
    }
}
