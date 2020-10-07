CREATE TABLE SystemUser (
  Id        serial,
  Login     varchar(64) NOT NULL,
  Password  varchar(255) NOT NULL,
  Email     text NOT NULL,
  FullName  varchar(255)
);

ALTER TABLE SystemUser ADD CONSTRAINT pkSystemUser PRIMARY KEY (Id);

CREATE UNIQUE INDEX akSystemUserLogin ON SystemUser (Login);
CREATE UNIQUE INDEX akSystemUserEmail ON SystemUser (Email);

CREATE TABLE Session (
  Id      serial,
  UserId  integer NOT NULL,
  Token   varchar(64) NOT NULL,
  IP      varchar(45) NOT NULL,
  Data    text
);

ALTER TABLE Session ADD CONSTRAINT pkSession PRIMARY KEY (Id);

CREATE UNIQUE INDEX akSession ON Session (Token);

ALTER TABLE Session ADD CONSTRAINT fkSessionUserId FOREIGN KEY (UserId) REFERENCES SystemUser (Id) ON DELETE CASCADE;

CREATE TABLE passwordResetUrl (
  Id        serial,
  UserId    integer NOT NULL,
  TimeStamp timestamp NOT NULL DEFAULT NOW(),
  Link      text NOT NULL
);

ALTER TABLE passwordResetUrl ADD CONSTRAINT pkUrl PRIMARY KEY (Id);

CREATE UNIQUE INDEX akUrlLink ON passwordResetUrl (Link);

ALTER TABLE passwordResetUrl ADD CONSTRAINT fkUrlUserId FOREIGN KEY (UserId) REFERENCES SystemUser (Id) ON DELETE CASCADE;

CREATE TABLE Jokes (
  Id      serial,
  UserId  integer NOT NULL,
  Joke    text NOT NULL
);

ALTER TABLE Jokes ADD CONSTRAINT pkJokesUser PRIMARY KEY (Id);
ALTER TABLE Jokes ADD CONSTRAINT fkJokesUserId FOREIGN KEY (UserId) REFERENCES SystemUser (Id) ON DELETE CASCADE;
