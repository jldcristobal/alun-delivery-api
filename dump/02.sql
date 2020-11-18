CREATE TABLE IF NOT EXISTS users (
    user_id INT NOT NULL AUTO_INCREMENT,
    user_type VARCHAR(8) NOT NULL,
    organization VARCHAR(100),
    username VARCHAR(25) NOT NULL,
    password VARCHAR(255) NOT NULL,
    salt VARCHAR(255) NOT NULL,
    PRIMARY KEY (user_id)
);