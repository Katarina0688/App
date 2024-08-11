DROP DATABASE IF EXISTS katalog_automobila;
CREATE DATABASE katalog_automobila;

USE katalog_automobila;

CREATE TABLE user_u
(
    u_id         INT AUTO_INCREMENT PRIMARY KEY,
    u_username   VARCHAR(255) NOT NULL,
    u_password   VARCHAR(255) NOT NULL,
    u_email      VARCHAR(255) NOT NULL,
    u_name       VARCHAR(255) NOT NULL,
    u_last_name  VARCHAR(255) NOT NULL,
    u_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE car_c
(
    c_id         INT AUTO_INCREMENT PRIMARY KEY,
    c_user_id    INT          NOT NULL,
    c_title      VARCHAR(255) NOT NULL,
    c_image_path VARCHAR(255) NOT NULL,
    c_link       VARCHAR(255) NOT NULL,
    c_video      VARCHAR(255),
    c_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (c_user_id) REFERENCES user_u (u_id) ON DELETE CASCADE
);

INSERT INTO user_u (u_username, u_password, u_email, u_name, u_last_name)
VALUES ('user1', 'password', 'user1@example.com', 'Name1', 'LastName1'),
       ('user2', 'password', 'user2@example.com', 'Name2', 'LastName2'),
       ('user3', 'password', 'user3@example.com', 'Name3', 'LastName3'),
       ('user4', 'password', 'user4@example.com', 'Name4', 'LastName4'),
       ('user5', 'password', 'user5@example.com', 'Name5', 'LastName5'),
       ('user6', 'password', 'user6@example.com', 'Name6', 'LastName6'),
       ('user7', 'password', 'user7@example.com', 'Name7', 'LastName7'),
       ('user8', 'password', 'user8@example.com', 'Name8', 'LastName8'),
       ('user9', 'password', 'user9@example.com', 'Name9', 'LastName9'),
       ('user10', 'password', 'user10@example.com', 'Name10', 'LastName10');









