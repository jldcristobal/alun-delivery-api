CREATE TABLE `delivery_status_histories` ( 
    `statusHistoryId` INT NOT NULL AUTO_INCREMENT , 
    `deliveryId` INT NOT NULL , 
    `status` VARCHAR(20) NOT NULL , 
    `remarks` VARCHAR(255) NULL ,
    `createdAt` TIMESTAMP NOT NULL , 
    `updatedAt` TIMESTAMP NOT NULL , 
    PRIMARY KEY (`statusHistoryId`)
) ENGINE = InnoDB;

ALTER TABLE `delivery_status_histories` 
ADD FOREIGN KEY (`deliveryId`) 
REFERENCES `deliveries`(`deliveryId`) 
ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `deliveries`
DROP COLUMN `pickupDatetime`, 
DROP COLUMN `deliveryDatetime`,
DROP COLUMN `status`;