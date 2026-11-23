-- Validación de datos en la base (corré esto UNA vez en SQL Editor si ya ejecutaste schema.sql antes)
alter table products add constraint products_name_len check (char_length(trim(name)) between 2 and 120);
alter table products add constraint products_stock_ok check (stock >= 0);
alter table products add constraint products_old_price_ok check (old_price is null or old_price > price);
alter table products add constraint products_tags_ok check (tags <@ array['viral','nuevo','mas_vendido','oferta','destacado']);
alter table products add constraint products_images_max check (cardinality(images) <= 8);
