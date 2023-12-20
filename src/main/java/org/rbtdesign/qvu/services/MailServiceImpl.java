package org.rbtdesign.qvu.services;

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
import java.util.Date;
import java.util.Properties;
import javax.annotation.PostConstruct;
import org.apache.commons.lang3.StringUtils;
import org.rbtdesign.qvu.dto.ScheduledDocument;
import org.rbtdesign.qvu.dto.SchedulerConfig;
import org.rbtdesign.qvu.util.Constants;
import org.rbtdesign.qvu.util.Helper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 *
 * @author rbtuc
 */
@Service
public class MailServiceImpl implements MailService {
    private static final Logger LOG = LoggerFactory.getLogger(MailServiceImpl.class);
    
    @PostConstruct
    private void init() {
        LOG.info("in MailServiceImpl.init()");
    }
    
    public void sendEmail(ScheduledDocument docinfo, SchedulerConfig schedulerConfig, byte[] attachment) {
        try {
            if (attachment != null) {
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

                session.setDebug(LOG.isDebugEnabled());

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

                BodyPart messageBodyPart = new MimeBodyPart();
                messageBodyPart.setText(docinfo.getGroup() + ": " + docinfo.getDocument());

                MimeBodyPart attachmentPart = new MimeBodyPart();
                attachmentPart.setDataHandler(new DataHandler(fds));
                attachmentPart.setFileName(getEmailAttachmentFileName(docinfo));
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

    private String getMimeType(ScheduledDocument docinfo) {
        String retval = docinfo.getDocument();
        if (Constants.DOCUMENT_TYPE_REPORT.equals(docinfo.getDocumentType())) {
            retval = "application/pdf";
        } else {
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
        }

        return retval;
    }

    private String getEmailAttachmentFileName(ScheduledDocument docinfo) {
        String retval = docinfo.getDocument();
        if (Constants.DOCUMENT_TYPE_REPORT.equals(docinfo.getDocumentType())) {
            retval = docinfo.getDocument().replace(".json", "") + ".pdf";
        } else {
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
        }
        
        return retval;
    }

}
