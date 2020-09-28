DROP TABLE IF EXISTS portfolio;
DROP TABLE IF EXISTS users;


CREATE TABLE public.users
(
    "_id" serial NOT NULL,
    "username" varchar NOT NULL,
    "hashed_password" varchar,
    "email" citext NOT NULL,
    "created" timestamp with time zone NOT NULL DEFAULT NOW(),
    "created_by_google" boolean NOT NULL,
    CONSTRAINT "users_pk" PRIMARY KEY ("_id") 
) WITH (
    OIDS=FALSE
);

CREATE TABLE public.portfolio
(
    "_id" serial NOT NULL,
    "user_id" integer NOT NULL,
    "name" varchar NOT NULL,
    "created" timestamp with time zone NOT NULL DEFAULT NOW(),
    "last_accessed" timestamp with time zone NOT NULL DEFAULT NOW(),
    CONSTRAINT "portfolio_pk" PRIMARY KEY ("_id"),
    CONSTRAINT "fk_users" FOREIGN KEY(user_id) REFERENCES users(_id)
) WITH (
    OIDS=FALSE
);

CREATE TABLE public.shares
(
    "_id" serial NOT NULL,
    "portfolio_id" integer NOT NULL,
    "ticker_name" varchar NOT NULL,
    "date_purchased" varchar NOT NULL,
    "price" integer NOT NULL,
    "number_shares" integer NOT NULL
) 
