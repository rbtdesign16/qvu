package org.rbtdesign.qvu.services;

import com.opencsv.CSVWriter;
import jakarta.activation.DataHandler;
import jakarta.activation.DataSource;
import jakarta.mail.Authenticator;
import jakarta.mail.Session;
import jakarta.mail.BodyPart;
import jakarta.mail.Message;
import jakarta.mail.Multipart;
import jakarta.mail.PasswordAuthentication;
import jakarta.mail.Transport;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeBodyPart;
import jakarta.mail.internet.MimeMessage;
import jakarta.mail.internet.MimeMultipart;
import jakarta.mail.util.ByteArrayDataSource;
import java.io.StringWriter;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import javax.annotation.PostConstruct;
import org.rbtdesign.qvu.client.utils.OperationResult;
import org.rbtdesign.qvu.dto.ExcelExportWrapper;
import org.rbtdesign.qvu.dto.QueryDocument;
import org.rbtdesign.qvu.dto.QueryResult;
import org.rbtdesign.qvu.dto.ScheduledDocument;
import org.rbtdesign.qvu.util.Constants;
import org.rbtdesign.qvu.util.FileHandler;
import org.rbtdesign.qvu.util.QueryRunner;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.PropertySource;
import org.springframework.scheduling.annotation.AsyncConfigurer;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

/**
 *
 * @author rbtuc
 */
@Service
@PropertySource(value = "file:${repository.folder}/config/scheduler.properties", ignoreResourceNotFound = true)
public class SchedulerService implements AsyncConfigurer {
    private static final Logger LOG = LoggerFactory.getLogger(SchedulerService.class);

    @Autowired
    private MainService mainService;

    @Autowired
    private FileHandler fileHandler;

    @Value("${scheduler.enabled:false}")
    private boolean schedulerEnabled;

    @Value("${max.scheduler.pool.size:10}")
    private int maxSchedulerPoolSize;

    @Value("${scheduler.execute.timeout.seconds:120}")
    private int schedulerExecuteTimeoutSeconds;

    @Value("${mail.smtp.auth:true}")
    private boolean mailSmtpAuth;

    @Value("${mail.smtp.starttls.enable:true}")
    private boolean mailSmtpStartTtls;

    @Value("${mail.from:}")
    private String mailFrom;

    @Value("${mail.smtp.host:}")
    private String mailSmtpHost;

    @Value("${mail.smtp.host:}")
    private String mailSmtpPort;

    @Value("${mail.smtp.ssl.trust:}")
    private String mailSmtpSslTrust;

    @Value("${mail.user:}")
    private String mailUser;

    @Value("${mail.password:}")
    private String mailPassword;

    @Value("${mail.subject:}")
    private String mailSubject;

    @PostConstruct
    private void init() {
        LOG.info("in SchedulerService.init()");
        LOG.info("scheduler.enabled=" + schedulerEnabled);
        LOG.info("max.scheduler.pool.size=" + maxSchedulerPoolSize);
        LOG.info("scheduler.execute.timeout.seconds=" + schedulerExecuteTimeoutSeconds);
    }

    @Scheduled(fixedRateString = "${scheduler.fixed.rate:60000}", initialDelay = 60000)
    public void runScheduledJobs() throws InterruptedException {
        if (schedulerEnabled) {
            ExecutorService executor = Executors.newFixedThreadPool(maxSchedulerPoolSize);
            for (ScheduledDocument docinfo : getScheduledDocuments()) {
                OperationResult<QueryDocument> dres = mainService.getDocument(Constants.DOCUMENT_TYPE_QUERY, docinfo.getGroup(), docinfo.getDocument());
                if (dres.isSuccess()) {
                    executor.execute(new QueryRunner(docinfo));
                }
            }
            executor.shutdown();
            try {
                if (!executor.awaitTermination(schedulerExecuteTimeoutSeconds, TimeUnit.SECONDS)) {
                    executor.shutdownNow();
                }
            } catch (InterruptedException e) {
                executor.shutdownNow();
            }
        }
    }

    private List<ScheduledDocument> getScheduledDocuments() {
        List<ScheduledDocument> retval = new ArrayList<>();

        return retval;
    }

    public void sendEmail(ScheduledDocument docinfo, Object result) {
        try {
            byte[] attachment = getAttachment(docinfo.getResultType(), result);
            if (attachment != null) {
                Properties prop = new Properties();
                prop.put("mail.smtp.auth", mailSmtpAuth);
                prop.put("mail.smtp.starttls.enable", mailSmtpStartTtls);
                prop.put("mail.smtp.host", mailSmtpHost);
                prop.put("mail.smtp.port", mailSmtpPort);
                prop.put("mail.smtp.ssl.trust", mailSmtpSslTrust);

                Session session = Session.getInstance(prop, new Authenticator() {
                    @Override
                    protected PasswordAuthentication getPasswordAuthentication() {
                        return new PasswordAuthentication(mailUser, mailPassword);
                    }
                });

                // Now use your ByteArrayDataSource as
                DataSource fds = new ByteArrayDataSource(attachment, getMimeType(docinfo));

                Message message = new MimeMessage(session);
                message.setFrom(new InternetAddress(mailFrom));

                message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(docinfo.getEmails()));
                message.setSubject(mailSubject);

                BodyPart messageBodyPart = new MimeBodyPart();
                messageBodyPart.setText("Mail Body");

                MimeBodyPart attachmentPart = new MimeBodyPart();
                attachmentPart.setDataHandler(new DataHandler(fds));
                attachmentPart.setFileName(getFileName(docinfo));
                Multipart multipart = new MimeMultipart();
                multipart.addBodyPart(messageBodyPart);
                multipart.addBodyPart(attachmentPart);
                message.setContent(multipart);
                Transport.send(message);
            }
        } catch (Exception ex) {
            LOG.error(ex.toString(), ex);
        }
    }

    private String getFileName(ScheduledDocument docinfo) {
        String retval = docinfo.getDocument();
        switch (docinfo.getResultType()) {
            case Constants.RESULT_TYPE_EXCEL:
                retval = docinfo.getDocument().replace(".json", "") + "xlsx";
                break;
            case Constants.RESULT_TYPE_CSV:
                retval = docinfo.getDocument().replace(".json", "") + "csv";
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
                retval = fileHandler.getGson(true).toJson(queryResult).getBytes();
                break;
        }

        return retval;
    }

    private byte[] toCsv(QueryResult queryResult) {
        byte[] retval = null;
        try (StringWriter strwriter = new StringWriter()) {
            // create CSVWriter object filewriter object as parameter
            CSVWriter writer = new CSVWriter(strwriter);

            String[] row = new String[queryResult.getHeader().size()];
            writer.writeNext(queryResult.getHeader().toArray(row));

            // add data to csv
            for (List<Object> l : queryResult.getData()) {
                writer.writeNext(toStringArray(l));
            }

            // closing writer connection
            writer.close();
            strwriter.flush();
            retval = strwriter.toString().getBytes();
        } catch (Exception ex) {
            LOG.error(ex.toString(), ex);
        }

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
}
