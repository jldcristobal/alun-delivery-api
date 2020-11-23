CREATE TABLE `deliveries` ( 
    `deliveryId` INT(11) NOT NULL AUTO_INCREMENT ,
    `trackingNumber` VARCHAR(12) NOT NULL UNIQUE ,
    `senderName` VARCHAR(100) NOT NULL , 
    `senderAddress` VARCHAR(100) NOT NULL , 
    `receiverName` VARCHAR(100) NOT NULL , 
    `receiverAddress` VARCHAR(100) NOT NULL , 
    `nearestLandmark` VARCHAR(100) NOT NULL,
    `receiverNumber` VARCHAR(11) NOT NULL , 
    `deliveryDate` DATE NOT NULL ,
    `status` VARCHAR(10) NOT NULL DEFAULT 'pending',
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP , 
    `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ,
    PRIMARY KEY (`deliveryId`)
) ENGINE = InnoDB CHARSET=utf8 COLLATE utf8_general_ci;

CREATE TABLE `deliveryItems` ( 
    `deliveryItemId` INT NOT NULL AUTO_INCREMENT , 
    `deliveryId` INT NOT NULL ,
    `packaging` VARCHAR(5) NOT NULL , 
    `weight` INT(3) NULL , 
    `isExpress` TINYINT(1) NOT NULL DEFAULT FALSE , 
    `deliveryFee` INT(3) NOT NULL , 
    `createdAt` DATETIME NOT NULL , 
    `updatedAt` DATETIME NOT NULL ,
    PRIMARY KEY (`deliveryItemId`)
) ENGINE = InnoDB CHARSET=utf8 COLLATE utf8_general_ci;

ALTER TABLE `deliveryitems` 
ADD FOREIGN KEY (`deliveryId`) 
REFERENCES `deliveries`(`deliveryId`) 
ON DELETE RESTRICT ON UPDATE RESTRICT;