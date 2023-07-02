/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package org.rbt.qvu.util;

import java.util.HashMap;
import java.util.Map;
import org.rbt.qvu.client.utils.OperationResult;

/**
 *
 * @author rbtuc
 */
public class Errors {
    private static final Map<Integer, String> ERROR_MESSAGE_MAP = new HashMap<>();
    public static final int FOLDER_IS_NOT_EMPTY = -1;
    public static final int FOLDER_NOT_FOUND = -2;

    static {
        ERROR_MESSAGE_MAP.put(OperationResult.RECORD_EXISTS, "errorCode1");
        ERROR_MESSAGE_MAP.put(OperationResult.EXISTING_RECORD_UPDATED, "errorCode2");
        ERROR_MESSAGE_MAP.put(OperationResult.RECORD_NOT_FOUND, "errorCode3");
        ERROR_MESSAGE_MAP.put(OperationResult.UNEXPECTED_EXCEPTION, "errorCode4");
        
        ERROR_MESSAGE_MAP.put(FOLDER_IS_NOT_EMPTY, "errorCode-1");
        ERROR_MESSAGE_MAP.put(FOLDER_NOT_FOUND, "errorCode-2");
    }

    public static String getMessage(Integer errorCode) {
        return ERROR_MESSAGE_MAP.get(errorCode);
    }
    public static String getMessage(Integer errorCode, String[] replace) {
        String retval = ERROR_MESSAGE_MAP.get(errorCode);   
        
        for (int i = 0; i < replace.length; ++i) {
            retval = retval.replace("$" + (i+1), replace[i]);
        }
        
        return retval;
    }
}
