package org.rbtdesign.qvu.util;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.opencsv.CSVWriter;
import jakarta.activation.DataHandler;
import jakarta.activation.DataSource;
import jakarta.mail.Authenticator;
import jakarta.mail.BodyPart;
import jakarta.mail.Message;
import jakarta.mail.Multipart;
import jakarta.mail.PasswordAuthentication;
import jakarta.mail.Session;
import jakarta.mail.Transport;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeBodyPart;
import jakarta.mail.internet.MimeMessage;
import jakarta.mail.internet.MimeMultipart;
import jakarta.mail.util.ByteArrayDataSource;
import java.io.StringWriter;
import java.util.Date;
import java.util.List;
import java.util.Properties;
import org.apache.commons.lang3.StringUtils;
import org.rbtdesign.qvu.client.utils.OperationResult;
import org.rbtdesign.qvu.dto.ExcelExportWrapper;
import org.rbtdesign.qvu.dto.QueryResult;
import org.rbtdesign.qvu.dto.QueryRunWrapper;
import org.rbtdesign.qvu.dto.ScheduledDocument;
import org.rbtdesign.qvu.dto.SchedulerConfig;
import org.rbtdesign.qvu.services.MainService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 *
 * @author rbtuc
 */
public class QueryRunner implements Runnable {
    private static final Logger LOG = LoggerFactory.getLogger(QueryRunner.class);
    private SchedulerConfig schedulerConfig;
    private ScheduledDocument docinfo;
    private MainService mainService;
    private final Gson prettyJson = new GsonBuilder().setPrettyPrinting().setDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSZ").disableHtmlEscaping().create();

    public QueryRunner(MainService mainService, SchedulerConfig schedulerConfig, ScheduledDocument docinfo) {
        this.docinfo = docinfo;
        this.schedulerConfig = schedulerConfig;
        this.mainService = mainService;
    }

    @Override
    public void run() {
        LOG.debug("running query for " + docinfo.getGroup() + ": " + docinfo.getDocument());
        try {
            OperationResult qres = null;
            switch (docinfo.getResultType()) {
                case Constants.RESULT_TYPE_EXCEL:
                case Constants.RESULT_TYPE_CSV:
                    qres = mainService.runQuery(new QueryRunWrapper(Constants.DEFAULT_ADMIN_USER, docinfo.getGroup(), docinfo.getDocument(), docinfo.getParameters()));
                    break;
                case Constants.RESULT_TYPE_JSON_FLAT:
                    qres = mainService.runJsonQuery(new QueryRunWrapper(Constants.DEFAULT_ADMIN_USER, docinfo.getGroup(), docinfo.getDocument(), docinfo.getParameters()));
                    break;
                case Constants.RESULT_TYPE_JSON_OBJECTGRAPH:
                    qres = mainService.runJsonObjectGraphQuery(new QueryRunWrapper(Constants.DEFAULT_ADMIN_USER, docinfo.getGroup(), docinfo.getDocument(), docinfo.getParameters()));
                    break;
            }

            if (qres != null) {
                if (qres.isSuccess()) {
                    sendEmail(docinfo, qres.getResult());
                } else {
                    LOG.error(qres.getMessage());
                }
            }

        } catch (Exception ex) {
            LOG.error(ex.toString(), ex);
        }
    }

    private void sendEmail(ScheduledDocument docinfo, Object result) {
        try {
            byte[] attachment = getAttachment(docinfo.getResultType(), result);
            System.out.println("---------------->a");
            if (attachment != null) {
                System.out.println("---------------->b=" + schedulerConfig.isSmtpStartTlsEnable());
                Properties props = new Properties();
                props.put("mail.smtp.auth", "" + schedulerConfig.isSmtpAuth());
                props.put("mail.smtp.starttls.enable", "" + schedulerConfig.isSmtpStartTlsEnable());
                props.put("mail.smtp.host", schedulerConfig.getSmtpHost());
                props.put("mail.smtp.port", "" + schedulerConfig.getSmtpPort());
                
                if (StringUtils.isNotEmpty(schedulerConfig.getSmtpSslTrust())) {
                    props.put("mail.smtp.ssl.trust", schedulerConfig.getSmtpSslTrust());
                }
                
                Session session = Session.getInstance(props, new Authenticator() {
                    @Override
                    protected PasswordAuthentication getPasswordAuthentication() {
                        return new PasswordAuthentication(schedulerConfig.getMailUser(), schedulerConfig.getMailPassword());
                    }
                });
                System.out.println("---------------->c");

                // Now use your ByteArrayDataSource as
                DataSource fds = new ByteArrayDataSource(attachment, getMimeType(docinfo));

                Message message = new MimeMessage(session);
                message.setFrom(new InternetAddress(schedulerConfig.getMailFrom()));

                InternetAddress[] addresses = new InternetAddress[docinfo.getEmailAddresses().size()];

                for (int i = 0; i < addresses.length; ++i) {
                    addresses[i] = new InternetAddress(docinfo.getEmailAddresses().get(i));
                }

                message.setRecipients(Message.RecipientType.TO, addresses);
                message.setSubject(schedulerConfig.getMailSubject().replace("$g", docinfo.getGroup()).replace("$d", docinfo.getDocument()).replace("$ts", Helper.TS.format(new Date())));
                System.out.println("---------------->d");

                BodyPart messageBodyPart = new MimeBodyPart();
                messageBodyPart.setText("Mail Body");

                MimeBodyPart attachmentPart = new MimeBodyPart();
                attachmentPart.setDataHandler(new DataHandler(fds));
                attachmentPart.setFileName(getEmailAttachmentFileName(docinfo));
                Multipart multipart = new MimeMultipart();
                multipart.addBodyPart(messageBodyPart);
                multipart.addBodyPart(attachmentPart);
                message.setContent(multipart);
                System.out.println("---------------->e");
                Transport.send(message);
                System.out.println("---------------->f");
            }
        } catch (Exception ex) {
            LOG.error(ex.toString(), ex);
        }
    }

    private String getEmailAttachmentFileName(ScheduledDocument docinfo) {
        String retval = docinfo.getDocument();
        switch (docinfo.getResultType()) {
            case Constants.RESULT_TYPE_EXCEL:
                retval = docinfo.getDocument().replace(".json", "") + ".xlsx";
                break;
            case Constants.RESULT_TYPE_CSV:
                retval = docinfo.getDocument().replace(".json", "") + ".csv";
                break;
            case Constants.RESULT_TYPE_JSON_FLAT:
            case Constants.RESULT_TYPE_JSON_OBJECTGRAPH:
                break;
        }

        return retval;
    }

    private String getMimeType(ScheduledDocument docinfo) {
        String retval = docinfo.getDocument();
        switch (docinfo.getResultType()) {
            case Constants.RESULT_TYPE_EXCEL:
                retval = "application/vnd.ms-excel";
                break;
            case Constants.RESULT_TYPE_CSV:
                retval = "text/csv";
                break;
            case Constants.RESULT_TYPE_JSON_FLAT:
            case Constants.RESULT_TYPE_JSON_OBJECTGRAPH:
                retval = "application/json";
                break;
        }

        return retval;
    }

    private byte[] getAttachment(String resultType, Object queryResult) throws Exception {
        byte[] retval = null;
        switch (resultType) {
            case Constants.RESULT_TYPE_EXCEL:
                retval = mainService.exportToExcel(getExcelWrapper((QueryResult) queryResult));
                break;
            case Constants.RESULT_TYPE_CSV:
                retval = toCsv((QueryResult) queryResult);
                break;
            case Constants.RESULT_TYPE_JSON_FLAT:
            case Constants.RESULT_TYPE_JSON_OBJECTGRAPH:
                retval = prettyJson.toJson(queryResult).getBytes();
                break;
        }

        return retval;
    }

    private byte[] toCsv(QueryResult queryResult) {
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

    private ExcelExportWrapper getExcelWrapper(QueryResult queryResult) {
        ExcelExportWrapper retval = new ExcelExportWrapper();

        retval.setHeaderFontColor("2F4F4F");
        retval.setHeaderBackgroundColor("85C1E9");
        retval.setHeaderFontSize(12);
        retval.setDetailFontColor("2F4F4F");
        retval.setDetailBackgroundColor1("FFFFFF");
        retval.setDetailBackgroundColor2("F0FFFF");
        retval.setDetailFontSize(11);

        retval.setQueryResults(queryResult);

        return retval;
    }

    private String[] toStringArray(List<Object> in) {
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
