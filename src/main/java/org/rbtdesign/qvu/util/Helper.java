package org.rbtdesign.qvu.util;

import com.opencsv.CSVWriter;
import java.io.FileInputStream;
import java.io.StringWriter;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;
import java.util.StringTokenizer;
import org.apache.commons.lang3.StringUtils;
import org.rbtdesign.qvu.dto.QueryResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 *
 * @author rbtuc
 */
public class Helper {
    public static final SimpleDateFormat TS = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
    public static final SimpleDateFormat TS2 = new SimpleDateFormat("yyyyMMddHHmmss");
    private static final Logger LOG = LoggerFactory.getLogger(Helper.class);

    public static Properties loadProperties(String fileName) {
        Properties retval = new Properties();
        try (FileInputStream is = new FileInputStream(fileName)) {
            retval.load(is);

        } catch (Exception ex) {
            LOG.error(ex.toString(), ex);
        }

        return retval;
    }

    public static List<String> commaDelimitedToList(String input) {
        List<String> retval = new ArrayList<>();

        if (StringUtils.isNotEmpty(input)) {
            StringTokenizer st = new StringTokenizer(input, ",");
            while (st.hasMoreTokens()) {
                retval.add(st.nextToken());
            }
        }

        return retval;
    }

    public static String listToString(List input) {
        StringBuilder retval = new StringBuilder();
        String comma = "";

        for (Object o : input) {
            retval.append(comma);
            retval.append(o);
            comma = ",";
        }

        return retval.toString();
    }

    public static String getDate(Object input) {
        String retval = null;
        if (input != null) {
            String s = input.toString();
            if (s.length() > 9) {
                retval = s.substring(0, 10);
            } else {
                retval = s;
            }
        }

        return retval;
    }

    public static String getTimestamp(Object input) {
        String retval = null;
        if (input != null) {
            String s = input.toString();

            if (s.length() > 19) {
                retval = s.substring(0, 19).replace("T", " ");
            } else {
                retval = s;
            }
        }

        return retval;
    }

    public static String getTime(Object input) {
        String retval = null;
        if (input != null) {
            String s = input.toString();

            int pos = s.indexOf("T");
            if ((pos > -1) && (s.length() > 1)) {
                retval = s.substring(pos + 2, 8);
            } else {
                retval = s;
            }
        }
        return retval;
    }

    public static String replaceTokens(String txt, List<String> replacements) {
        String retval = txt;
        if (StringUtils.isNotEmpty(retval)) {
            for (int i = 0; i < replacements.size(); ++i) {
                String token = "$" + (i+1);
                retval = retval.replace(token, replacements.get(i));
            }
        }
        
        return retval;
    }
    
    public static byte[] toCsv(QueryResult queryResult) {
        byte[] retval = null;
        try (StringWriter strwriter = new StringWriter(); CSVWriter writer = new CSVWriter(strwriter);) {

            String[] row = new String[queryResult.getHeader().size()];
            writer.writeNext(queryResult.getHeader().toArray(row));

            // add data to csv
            for (List<Object> l : queryResult.getData()) {
                writer.writeNext(toStringArray(l));
            }

            retval = strwriter.toString().getBytes();
        } catch (Exception ex) {
            LOG.error(ex.toString(), ex);
        }

        return retval;
    }

    public static String[] toStringArray(List<Object> in) {
        String[] retval = new String[in.size()];

        for (int i = 0; i < retval.length; ++i) {
            Object o = in.get(i);
            if (o == null) {
                retval[i] = null;
            } else {
                retval[i] = o.toString();
            }
        }

        return retval;
    }

}
