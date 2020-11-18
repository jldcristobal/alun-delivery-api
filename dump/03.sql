CREATE TABLE `alunyvut_rinconadadd`.`deliveries` ( 
    `deliveryId` INT NOT NULL AUTO_INCREMENT , 
    `pickUpLocation` VARCHAR(100) NOT NULL , 
    `receiverName` VARCHAR(100) NOT NULL , 
    `receiverAddress` VARCHAR NOT NULL , 
    `nearestLandmark` VARCHAR(100) NOT NULL,
    `receiverNumber` INT(11) NOT NULL , 
    `itemPackaging` VARCHAR(10) NOT NULL , 
    `itemWeight` INT NULL , 
    `isExpress` BOOLEAN NOT NULL DEFAULT FALSE , 
    `deliveryFee` INT(3) NOT NULL , 
    `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP , 
    `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ,
    PRIMARY KEY (`deliveryId`)
) ENGINE = InnoDB CHARSET=utf8 COLLATE utf8_general_ci;