create table prezzi_storici
(
    id              int auto_increment
        primary key,
    data            date                                                                     not null,
    desc_carburante varchar(32)                                                              not null,
    livello_geo     enum ('nazionale', 'regionale', 'provinciale', 'comune', 'distributore') not null,
    codice_geo      varchar(32)                                                              not null,
    prezzo_medio    decimal(7, 3)                                                            not null,
    prezzo_min      decimal(7, 3)                                                            not null,
    prezzo_max      decimal(7, 3)                                                            not null
);

