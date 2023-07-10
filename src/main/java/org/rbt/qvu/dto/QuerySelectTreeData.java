/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package org.rbt.qvu.dto;

import io.micrometer.common.util.StringUtils;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.rbt.qvu.util.DatasourceSettingsHelper;

/**
 *
 * @author rbtuc
 */
public class QuerySelectTreeData {
    private String datasourceName;
    private List<QuerySelectNode> data = new ArrayList<>();

    public QuerySelectTreeData(DatasourceSettingsHelper dsHelper, String datasourceName, List<Table> tableInfo) {
        this.datasourceName = datasourceName;
        QuerySelectNode root = new QuerySelectNode();
        root.setName("");
        root.setType(QuerySelectNode.NODE_TYPE_ROOT);
        data.add(root);

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
                root.getChildren().add(n);
                loadColumns(n, ta, t);
                loadForeignKeys(n, dsHelper, t, t.getImportedKeys());
                loadForeignKeys(n, dsHelper, t, t.getExportedKeys());
            }
        }
    }

    private void loadColumns(QuerySelectNode n, TableSettings ta, Table t) {
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

    private void loadForeignKeys(QuerySelectNode n, DatasourceSettingsHelper dsHelper, Table t, List<ForeignKey> fkList) {
        if (fkList != null) {
            for (ForeignKey fk : fkList) {
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
                    fkn.setType(QuerySelectNode.NODE_TYPE_FOREIGNKEY);
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
                }
            }
        }
    }

    public String getDatasourceName() {
        return datasourceName;
    }

    public void setDatasourceName(String datasourceName) {
        this.datasourceName = datasourceName;
    }

    public List<QuerySelectNode> getData() {
        return data;
    }

    public void setData(List<QuerySelectNode> data) {
        this.data = data;
    }

}
