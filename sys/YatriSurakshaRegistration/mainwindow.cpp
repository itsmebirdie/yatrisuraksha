#include "mainwindow.h"
#include "ui_mainwindow.h"
#include <QJsonDocument>
#include <QJsonObject>
#include <QMessageBox>
#include <QJsonArray>
#include <QPixmap>
#include <QImage>

MainWindow::MainWindow(QWidget *parent)
    : QMainWindow(parent)
    , ui(new Ui::MainWindow)
{
    ui->setupUi(this);

    // Initialize the network manager
    networkManager = new QNetworkAccessManager(this);

    // Connect the "Register" button to our slot
    connect(ui->registerButton, &QPushButton::clicked, this, &MainWindow::on_registerButton_clicked);
}

MainWindow::~MainWindow()
{
    delete ui;
}

void MainWindow::on_registerButton_clicked()
{
    // Get data from the UI input fields
    QString govtId = ui->governmentIdInput->text();
    QString nationality = ui->nationalityInput->text();
    QString firstName = ui->firstNameInput->text();
    QString lastName = ui->lastNameInput->text();
    QString familyContacts = ui->familyContactsInput->toPlainText();

    // Create a JSON object to send to the server
    QJsonObject touristData;
    touristData["government_id"] = govtId;
    touristData["nationality"] = nationality;
    touristData["first_name"] = firstName;
    touristData["last_name"] = lastName;

    // Validate and add family contacts
    QJsonDocument contactsDoc = QJsonDocument::fromJson(familyContacts.toUtf8());
    if (contactsDoc.isNull() || !contactsDoc.isArray()) {
        QMessageBox::warning(this, "Input Error", "Family Contacts must be a valid JSON array.");
        return;
    }
    touristData["family_contacts"] = contactsDoc.array();

    // Convert the JSON object to a JSON document
    QJsonDocument jsonDoc(touristData);

    // Create the HTTP request
    QNetworkRequest request;
    request.setUrl(QUrl("http://3.108.41.199:8080/register-tourist"));
    request.setHeader(QNetworkRequest::ContentTypeHeader, "application/json");

    // Connect the reply signal to our slot
    connect(networkManager, &QNetworkAccessManager::finished, this, &MainWindow::onRegistrationFinished);

    // Send the POST request
    ui->statusLabel->setText("Registering...");
    networkManager->post(request, jsonDoc.toJson());
}

void MainWindow::onRegistrationFinished(QNetworkReply *reply)
{
    // Disconnect the signal to avoid multiple connections
    disconnect(networkManager, &QNetworkAccessManager::finished, this, &MainWindow::onRegistrationFinished);

    if (reply->error() == QNetworkReply::NoError) {
        QByteArray responseData = reply->readAll();
        QJsonDocument jsonResponse = QJsonDocument::fromJson(responseData);
        QJsonObject jsonObj = jsonResponse.object();
        QString did = jsonObj["did"].toString();

        ui->statusLabel->setText(QString("Registration Successful!"));

        // Call the new function to display the QR code
        displayQrCode(did);

    } else {
        ui->statusLabel->setText(QString("Registration Failed: %1").arg(reply->errorString()));
    }

    reply->deleteLater();
}

void MainWindow::displayQrCode(const QString& did)
{
    // Convert QString to std::string for the QR code library
    std::string data = did.toStdString();

    // Create a QR code object
    qrcodegen::QrCode qr = qrcodegen::QrCode::encodeText(data.c_str(), qrcodegen::QrCode::Ecc::MEDIUM);

    // Get the size of the QR code
    int size = qr.getSize();
    int scale = 10; // Adjust the scale for a larger image

    // Create a QImage to store the QR code data
    QImage image(size * scale, size * scale, QImage::Format_RGB32);
    image.fill(Qt::white); // Fill background with white

    // Iterate through each QR code module and draw a black rectangle
    for (int y = 0; y < size; ++y) {
        for (int x = 0; x < size; ++x) {
            if (qr.getModule(x, y)) {
                QColor black(0, 0, 0);
                image.setPixelColor(x * scale, y * scale, black);

                // Fill the scaled block
                for(int i = 0; i < scale; ++i) {
                    for(int j = 0; j < scale; ++j) {
                        image.setPixelColor(x * scale + i, y * scale + j, black);
                    }
                }
            }
        }
    }

    // Convert QImage to QPixmap and set it to the QLabel
    ui->qrCodeLabel->setPixmap(QPixmap::fromImage(image));
    ui->qrCodeLabel->setScaledContents(true);
}
