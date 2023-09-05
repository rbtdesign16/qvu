/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package org.rbtdesign.qvu.util;

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
    public static final int DB_CONNECTION_FAILED = -3;
    public static final int RECORD_UPDATED = -4;
    public static final int DOCUMENT_NOT_FOUND = -5;
    public static final int NOT_SUPPORTED = -100;

    static {
        ERROR_MESSAGE_MAP.put(OperationResult.RECORD_EXISTS, "errorCode1");
        ERROR_MESSAGE_MAP.put(OperationResult.EXISTING_RECORD_UPDATED, "errorCode2");
        ERROR_MESSAGE_MAP.put(OperationResult.RECORD_NOT_FOUND, "errorCode3");
        ERROR_MESSAGE_MAP.put(OperationResult.UNEXPECTED_EXCEPTION, "errorCode4");
        
        ERROR_MESSAGE_MAP.put(FOLDER_IS_NOT_EMPTY, "errorCode-1");
        ERROR_MESSAGE_MAP.put(FOLDER_NOT_FOUND, "errorCode-2");
        ERROR_MESSAGE_MAP.put(DB_CONNECTION_FAILED, "errorCode-3");
        ERROR_MESSAGE_MAP.put(RECORD_UPDATED, "errorCode-4");
        ERROR_MESSAGE_MAP.put(DOCUMENT_NOT_FOUND, "errorCode-5");
        ERROR_MESSAGE_MAP.put(NOT_SUPPORTED, "errorCode-100");
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
    
    public static void populateError(OperationResult result, Exception ex) {
        result.setErrorCode(OperationResult.UNEXPECTED_EXCEPTION);
        result.setMessage(ex.toString());
    }
 
}
