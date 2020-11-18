CREATE TABLE IF NOT EXISTS merchants (
    merchant_id INT NOT NULL AUTO_INCREMENT,
    merchant_name VARCHAR(100) NOT NULL,
    PRIMARY KEY (merchant_id)
);

CREATE TABLE IF NOT EXISTS merchant_contacts (
    merchant_contact_id INT NOT NULL AUTO_INCREMENT,
    merchant_id INT NOT NULL,
    merchant_contact_name VARCHAR(255) NOT NULL,
    merchant_contact_email VARCHAR(255) NOT NULL,
    PRIMARY KEY (merchant_contact_id),
    FOREIGN KEY (merchant_id) REFERENCES merchants(merchant_id)
);