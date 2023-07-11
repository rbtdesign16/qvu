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
        for (Table t : tableInfo) {
            QuerySelectNode n = new QuerySelectNode();
            n.getMetadata().put("type", QuerySelectNode.NODE_TYPE_TABLE);
            n.getMetadata().put("dbname", t.getName());

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
                loadForeignKeys(n, dsHelper, datasourceName, tMap, t, t.getImportedKeys(), true, maxImportedKeyDepth, 0, fkSet);
                loadForeignKeys(n, dsHelper,  datasourceName, tMap, t, t.getExportedKeys(), false, maxExportedKeyDepth, 0, fkSet);
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

    private static void loadForeignKeys(QuerySelectNode n, DatasourceSettingsHelper dsHelper, String datasourceName, Map<String, Table> tMap, Table t, List<ForeignKey> fkList, boolean imported, int maxDepth, int curDepth, Set<String> fkSet) {
        if (curDepth <= maxDepth) {
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
                            if (imported) {
                                fkn.getMetadata().put("type", QuerySelectNode.NODE_TYPE_IMPORTED_FOREIGNKEY);
                            } else {
                                fkn.getMetadata().put("type", QuerySelectNode.NODE_TYPE_EXPORTED_FOREIGNKEY);
                            }
                            fkn.getMetadata().put("dbname",  fk.getToTableName());
                            fkn.setName(toTable);
                            fkn.getMetadata().put("fkname",  fk.getName());
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
                            
                       
                            loadColumns(fkn, ts, fkt);
                            if (curDepth < maxDepth) {
                                if (imported) {
                                    loadForeignKeys(fkn, dsHelper, datasourceName, tMap, fkt, fkt.getImportedKeys(), imported, maxDepth, curDepth + 1, fkSet);
                                } else {
                                    loadForeignKeys(fkn, dsHelper, datasourceName, tMap, fkt, fkt.getExportedKeys(), imported, maxDepth, curDepth + 1, fkSet);
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
