package org.rbtdesign.qvu.services;

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
import java.io.File;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import javax.annotation.PostConstruct;
import org.rbtdesign.qvu.client.utils.OperationResult;
import org.rbtdesign.qvu.dto.QueryDocument;
import org.rbtdesign.qvu.dto.ScheduledDocument;
import org.rbtdesign.qvu.util.Constants;
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
    private static final Logger LOG = LoggerFactory.getLogger(MainServiceImpl.class);

    @Autowired
    private MainService mainService;

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

    public void sendEmail(ScheduledDocument docinfo, byte[] attachment) {
        try {
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
            DataSource fds = new ByteArrayDataSource(attachment, "application/vnd.ms-excel");

            Message message = new MimeMessage(session);
            message.setFrom(new InternetAddress(mailFrom));
            
            
            message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(docinfo.getEmails()));
            message.setSubject(mailSubject);

            BodyPart messageBodyPart = new MimeBodyPart();
            messageBodyPart.setText("Mail Body");

            MimeBodyPart attachmentPart = new MimeBodyPart();
            attachmentPart.attachFile(new File("path/to/file"));
            Multipart multipart = new MimeMultipart();
            multipart.addBodyPart(messageBodyPart);
            multipart.addBodyPart(attachmentPart);
            message.setContent(multipart);
            Transport.send(message);
        } catch (Exception ex) {
        }
    }
}
