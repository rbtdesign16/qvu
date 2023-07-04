/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package org.rbt.qvu.util;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;

/**
 *
 * @author rbtuc
 */
public class DBHelper {
    public static void closeConnection(Connection conn, Statement stmt, ResultSet res) {
        if (res != null) {
            try {
                res.close();
            } catch (Exception ex) {};
        }

           if (stmt != null) {
            try {
                stmt.close();
            } catch (Exception ex) {};
        }

           if (conn != null) {
            try {
                conn.close();
            } catch (Exception ex) {};
        }
    }
}
