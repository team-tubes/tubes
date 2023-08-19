-- Add migration script here
create table complaints (
    id SERIAL PRIMARY KEY,
    
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,

    lng FLOAT8 NOT NULL,
    lat FLOAT8 NOT NULL,
    address TEXT,

    complaint TEXT NOT NULL
);