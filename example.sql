--
-- Table strucure for table `author`
--

CREATE TABLE `author` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `name` varchar(20) NOT NULL,
    `profile` varchar(200) DEFAULT NULL,
    PRIMARY KEY (`id`)
);

--
--Dumping data for table `author`
--

INSERT INTO `author` VALUES (1, 'jiwoo', 'back-end developer');
INSERT INTO `author` VALUES (2, 'jiyoung', 'mechanical engineer');
INSERT INTO `author` VALUES (3, 'miae', 'ui/ux designer');

--
-- Table structure for table `topic`
--

CREATE TABLE `topic` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `title` varchar(30) NOT NULL,
    `description` text,
    `created` datetime NOT NULL,
    `author_id` int(11) DEFAULT NULL,
    PRIMARY KEY (`id`)
);

--
-- Dumping data for table `topic`
--

INSERT INTO `topic` VALUES (1, 'MySQL', 'MySQL is ...', now(), 1);
INSERT INTO `topic` VALUES (2, 'Node.js', 'Node.js is ...', now(), 1);
INSERT INTO `topic` VALUES (3, 'AutoCAD 3D', '3D is ...', now(), 2);
INSERT INTO `topic` VALUES (4, 'Photoshop master', 'Photoshop is ...', now(), 3);
INSERT INTO `topic` VALUES (5, 'Express', 'Express is ...', now(), 1);